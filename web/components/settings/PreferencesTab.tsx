'use client'
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DIETS, GOALS } from "@/lib/config";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import useUpdateUserPreferences from "@/hooks/useUpdateUserPreferences";
import { Input } from "../ui/input";

export default function PreferencesTab() {
  const { data: preferences } = useGetUserPreferences();
  const { mutate: updatePreferenceMutation } = useUpdateUserPreferences();

  return (
    <TabsContent value="preferences" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Objetivo y dieta</CardTitle>
          <CardDescription>
            Configura tu objetivo principal y tipo de alimentación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Objetivo principal</Label>
              <Select
                value={preferences?.primaryGoal ?? ""}
                onValueChange={(value) =>
                  updatePreferenceMutation({ primaryGoal: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map(({ id, label }) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de dieta</Label>
              <Select
                value={preferences?.dietType ?? ""}
                onValueChange={(value) =>
                  updatePreferenceMutation({ dietType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIETS.map(({ id, label }) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Porciones</CardTitle>
          <CardDescription>
            Ajusta las cantidades de las recetas según tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>¿Para cuántas personas cocinas?</Label>
            <Select
              value={preferences?.servings.toString()}
              onValueChange={(value) =>
                updatePreferenceMutation({ servings: Number(value) })
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 persona</SelectItem>
                <SelectItem value="2">2 personas</SelectItem>
                <SelectItem value="3">3 personas</SelectItem>
                <SelectItem value="4">4 personas</SelectItem>
                <SelectItem value="5">5 personas</SelectItem>
                <SelectItem value="6">6 personas</SelectItem>
                <SelectItem value="7">7 personas</SelectItem>
                <SelectItem value="8">8 personas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meal Times */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios de comida</CardTitle>
          <CardDescription>
            Personaliza los horarios para recibir recordatorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="breakfast">Desayuno</Label>
              <Input
                id="breakfast"
                type="time"
                value={preferences?.breakfastTime}
                onChange={(e) =>
                  updatePreferenceMutation({
                    breakfastTime: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunch">Almuerzo</Label>
              <Input
                id="lunch"
                type="time"
                value={preferences?.lunchTime}
                onChange={(e) =>
                  updatePreferenceMutation({
                    lunchTime: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dinner">Cena</Label>
              <Input
                id="dinner"
                type="time"
                value={preferences?.dinnerTime}
                onChange={(e) =>
                  updatePreferenceMutation({
                    dinnerTime: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
