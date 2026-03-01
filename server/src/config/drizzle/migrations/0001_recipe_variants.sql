ALTER TABLE "recipes"
ADD COLUMN IF NOT EXISTS "parent_recipe_id" uuid REFERENCES "recipes"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "recipes_parent_recipe_id_idx"
ON "recipes" ("parent_recipe_id");
