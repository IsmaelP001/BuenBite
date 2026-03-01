import { Injectable } from "@nestjs/common";
import { ScanReceipt } from "../../domain/ingredients.model";
import { DishAnalysis } from "../../domain/recipe.model";
import { IaRepository } from "../../domain/repositories";

@Injectable()
export class IaRepositoryImpl implements IaRepository {
  private apiKey: string;
  constructor() {
    this.apiKey = process.env.FIREWORKS_DEEPSEEK_API_KEY!;
  }
  async generateRecipe(prompt: string): Promise<any> {
    const apiKey = this.apiKey;
    const model = "accounts/fireworks/models/deepseek-v3";

    const body = {
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    };

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al generar receta: ${error}`);
    }

    const result = await response.json();
    const jsonRes = result.choices[0].message.content;
    return this.sanitizeJSON(jsonRes);
  }

  async scanFood(image: any): Promise<DishAnalysis> {
    const apiKey = this.apiKey;
    const url = "https://api.fireworks.ai/inference/v1/chat/completions";
    const requestBody = {
      model: "accounts/fireworks/models/llama4-maverick-instruct-basic",
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza la imagen de comida y devuelve SOLO un JSON con esta estructura exacta:
{
  "dishName": "nombre del platillo",
  "ingredients": [
    {"standardName": "nombre simple en minúsculas", "measurementValue": número o 0, "measurementType": "unidad"}
  ],
  "totalNutrition": {"calories": número, "proteins": número, "carbohydrates": número, "fats": número},
  "servingSize": "tamaño de las porciones totales en numero entero"
}
Reglas:
1. measurementType debe ser una de: gram, kg, liter, ml, unit, oz, lb, cup, tbsp, tsp.
2. No agregues texto, explicaciones ni la palabra JSON. Solo devuelve el objeto válido.`,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("response", data);

      const rawJson = data.choices?.[0]?.message?.content;
      console.log("rawJson", rawJson);
      if (!rawJson) {
        throw new Error("No response content found");
      }

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status} ${response.statusText}`
        );
      }
      const parsed = this.sanitizeJSON(rawJson);
      console.log("parsed", parsed);

      const result: DishAnalysis = {
        dishName: parsed.dishName,
        ingredients: parsed.ingredients,
        totalNutrition: parsed.totalNutrition,
        servingSize: parsed.servingSize,
      };

      return result;
    } catch (err) {
      console.error("Error parsing JSON response:", err);
      throw new Error("Failed to parse response JSON");
    }
  }

  async scanReceipt(imageUri: any): Promise<ScanReceipt> {
    const apiKey = this.apiKey;
    const prompt = `Analiza este recibo y extrae SOLO los productos comprados.

Devuelve JSON con este formato:
{
  "items": [
    {
      "raw": "texto exacto del recibo",
      "standardName": "nombre limpio, simple, en minúsculas sin marcas",
      "measurementValue": número o 0,
      "measurementType": "unidad normalizada"
    }
  ]
}

REGLAS:
1. Ignora totales, fechas, impuestos, direcciones
2. Si hay unidad explícita, normalízala a: gram, kg, liter, ml, unit, oz, lb, cup, tbsp, tsp
3. Si NO hay unidad, infiere según tipo:
   - Líquidos → liter
   - Sólidos/peso → gram  
   - Contables → unit

EJEMPLOS:
Entrada: "LECHE ENTERA 1L"
Salida: {"originalText":"LECHE ENTERA 1L","scannedName":"leche","measurementValue":1,"measurementType":"liter"}

Entrada: "AZÚCAR 500G"
Salida: {"originalText":"AZÚCAR 500G","scannedName":"azúcar","measurementValue":500,"measurementType":"gram"}

Entrada: "PAN BIMBO"
Salida: {"originalText":"PAN BIMBO","scannedName":"pan","measurementValue":null,"measurementType":"unit"}

Solo devuelve el JSON válido, sin texto adicional.`;

    try {
      const response = await fetch(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "accounts/fireworks/models/qwen2p5-vl-32b-instruct",
            max_tokens: 4096,
            temperature: 0.1,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUri,
                    },
                  },
                  {
                    type: "text",
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || "";

      console.log("Texto generado:", generatedText);
      return this.sanitizeJSON(generatedText)?.items || [];
    } catch (error) {
      console.error("Error en scanReceipt:", error);
      throw error;
    }
  }

  sanitizeJSON(raw: string): any {
    let cleaned = raw.trim();

    // Remover bloques de código markdown (```json ... ```)
    if (cleaned.startsWith("```")) {
      // Encontrar el primer salto de línea después de ```json
      const firstNewline = cleaned.indexOf("\n");
      // Encontrar los backticks de cierre
      const lastBackticks = cleaned.lastIndexOf("```");

      if (firstNewline !== -1 && lastBackticks !== -1) {
        cleaned = cleaned.substring(firstNewline + 1, lastBackticks).trim();
      }
    }

    try {
      return JSON.parse(cleaned);
    } catch (err: any) {
      console.error("JSON inválido:", cleaned);
      throw new Error(
        `Invalid JSON format after sanitizing input: ${err.message}`
      );
    }
  }
}
