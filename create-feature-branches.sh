#!/bin/bash
set -e

REPO="/Users/ismaelperez/Documents/good-bite"
cd "$REPO"

# Ensure we're clean and on develop
git checkout develop 2>/dev/null

create_branch() {
  local BRANCH="$1"
  shift
  local MSG="$1"
  shift
  local FILES=("$@")

  echo ""
  echo "========================================="
  echo "Creating branch: $BRANCH"
  echo "========================================="

  git checkout main
  git checkout -b "$BRANCH"

  # Checkout files from develop
  for f in "${FILES[@]}"; do
    git checkout develop -- "$f" 2>/dev/null || echo "  WARN: $f not found, skipping"
  done

  git add -A
  git commit -m "$MSG" --allow-empty
  echo "✅ $BRANCH created with $(git diff --stat main | tail -1)"
}

# ─────────────────────────────────────────────
# PR 1: feat/core-setup
# ─────────────────────────────────────────────
CORE_FILES=(
  # Config
  "package.json"
  "package-lock.json"
  "next.config.ts"
  "components.json"
  "middleware.ts"
  "tsconfig.json"
  # App shell
  "app/globals.css"
  "app/layout.tsx"
  # Auth
  "app/auth"
  "actions/auth.ts"
  "lib/context/authContext.tsx"
  "lib/supabase"
  "lib/config"
  # HTTP & utils
  "lib/http"
  "lib/utils.ts"
  "lib/queryClient.ts"
  "lib/constants.tsx"
  # Base types
  "types/index.ts"
  "types/models/ingredient.ts"
  "types/models/ia.ts"
  "types/models/recipes.ts"
  "types/models/pantry.ts"
  "types/models/purchase.ts"
  "types/models/mealplan.ts"
  "types/models/user.ts"
  "types/models/onboarding.ts"
  # All services (shared across features)
  "services/apiClient.ts"
  "services/serverApiClient.ts"
  "services/api/ingredientsService.ts"
  "services/api/recepiesService.ts"
  "services/api/pantryService.ts"
  "services/api/purchasesService.ts"
  "services/api/mealplanService.ts"
  "services/api/userService.ts"
  # All actions (shared)
  "actions/ingredients.ts"
  "actions/recipes.ts"
  "actions/pantry.ts"
  "actions/purchase.ts"
  "actions/mealplan.ts"
  "actions/user.ts"
  # UI components (shadcn)
  "components/ui"
  # Shared components
  "components/SupabaseProvider.tsx"
  "components/Navbar.tsx"
  "components/NavLink.tsx"
  "components/Footer.tsx"
  "components/MaxWithWrapper.tsx"
  "components/Loading.tsx"
  "components/ErrorWraper.tsx"
  "components/HorizontalScrollList.tsx"
  "components/TabContainer.tsx"
  "components/QuantityInput.tsx"
  # Shared hooks
  "hooks/useAppMutation.tsx"
  "hooks/useAppToast.tsx"
  "hooks/useAuthPrompt.ts"
  "hooks/hasChangedDetector.ts"
  "hooks/useIntesectionObserver.ts"
  "hooks/useOptimisticMutation.tsx"
  # Pages layout
  "app/(pages)/layout.tsx"
)

create_branch "feat/core-setup" \
  "feat(core): project setup, auth, types, services, shared UI

- Next.js config, Tailwind, shadcn/ui components
- Supabase auth (client/server/proxy), middleware, auth context
- HTTP client, API client, all service classes
- All type definitions (ingredient, recipe, pantry, purchase, mealplan, user)
- All server actions
- Shared components: Navbar, Footer, MaxWidthWrapper, Loading
- Shared hooks: useAppMutation, useAppToast, useAuthPrompt
- App shell (layout, globals.css)" \
  "${CORE_FILES[@]}"

# ─────────────────────────────────────────────
# PR 2: feat/home-page
# ─────────────────────────────────────────────
HOME_FILES=(
  "app/(pages)/page.tsx"
  "components/home"
  "components/RecipeCard.tsx"
  "components/CompactedRecipeCard.tsx"
  "components/MealplanCard.tsx"
  "components/IngredientCard.tsx"
  "components/SaveRecipeBtn.tsx"
  "components/RecipesNavbarMenu.tsx"
  "hooks/useGetLatestCommunityRecipes.ts"
  "hooks/UseGetLatestCookedCommunityRecipes.ts"
  "hooks/useGetRecentRecipesViewed.ts"
  "hooks/useGetDefaultSuggestedMealplans.ts"
  "hooks/useGetActiveUserPlan.ts"
  "hooks/useGetUserMealplanConfig.ts"
  "hooks/useGetPantryItems.ts"
  "hooks/useGetUserSavedRecipes.ts"
  "hooks/useGetUserRecommendedRecipes.ts"
  "hooks/useSaveUserRecipe.ts"
  "hooks/useSaveRecipeViewed.ts"
  "hooks/useGetUserPreferences.ts"
)

create_branch "feat/home-page" \
  "feat(home): landing page and home dashboard

- Hero section, CTA, newsletter banner
- User dashboard: pantry summary, scheduled meals, recommendations
- Community recipes, suggested recipes, mealplan suggestions
- Recipe cards, mealplan cards, ingredient cards
- Related hooks for data fetching" \
  "${HOME_FILES[@]}"

# ─────────────────────────────────────────────
# PR 3: feat/pantry
# ─────────────────────────────────────────────
PANTRY_FILES=(
  "app/(pages)/pantry"
  "components/pantry"
  "components/PantryRecipeCard.tsx"
  "lib/context/pantryIngredientContext.tsx"
  "lib/mock/pantryItems.ts"
  "hooks/useGetPantryItems.ts"
  "hooks/useCreatePantry.ts"
  "hooks/useUpdatePantryItem.ts"
  "hooks/useGetPantryTransactions.ts"
  "hooks/getPantryDetails.ts"
  "hooks/getRecommendedByPantryRecipes.ts"
  "hooks/usePantryShopping.ts"
  "hooks/useIaScanPantryUsage.ts"
  "hooks/useSaveScanIaPantryIngredients.ts"
  "hooks/useScanPantryReceipt.ts"
  "hooks/useIngredientSelection.ts"
  "hooks/useGetIngredients.ts"
  "hooks/useCreateIngredient.ts"
  "hooks/useGetFilterActiveIngredients.ts"
  "hooks/useGetIngredientRelatedRecipes.ts"
)

create_branch "feat/pantry" \
  "feat(pantry): pantry management system

- Pantry CRUD pages (list, detail, create)
- Ingredient selection context and modal
- Pantry categories, search, filters
- Related recipes sidebar
- Transaction history
- IA scan for pantry items and receipts
- Mock pantry data for development" \
  "${PANTRY_FILES[@]}"

# ─────────────────────────────────────────────
# PR 4: feat/recipes
# ─────────────────────────────────────────────
RECIPE_FILES=(
  "app/(pages)/recipes"
  "components/recipes"
  "components/RecipeCard.tsx"
  "components/CompactedRecipeCard.tsx"
  "components/PantryRecipeCard.tsx"
  "components/SaveRecipeBtn.tsx"
  "components/RecipesNavbarMenu.tsx"
  "components/IngredientCard.tsx"
  "hooks/useGetRecipeDetails.ts"
  "hooks/useGetRecipeIngredients.ts"
  "hooks/useGetRecipeCooked.ts"
  "hooks/useGetRecipeTips.ts"
  "hooks/useGetRecipeMostRecentTip.ts"
  "hooks/useCookingSteps.ts"
  "hooks/useCreateRecipe.ts"
  "hooks/useFilterRecipes.ts"
  "hooks/useSearchRecipes.ts"
  "hooks/useSaveRecipeCooked.ts"
  "hooks/useSaveRecipeTip.ts"
  "hooks/useSaveRecipeViewed.ts"
  "hooks/useGetRecentRecipesViewed.ts"
  "hooks/useGetInfinitiveRecipes.ts"
  "hooks/useGetUserRecommendedRecipes.ts"
  "hooks/useGetUserSavedRecipes.ts"
  "hooks/useSaveUserRecipe.ts"
  "hooks/useRecipeServings.ts"
  "hooks/useScanFoodIA.ts"
  "hooks/useGetIngredients.ts"
)

create_branch "feat/recipes" \
  "feat(recipes): recipe browsing, creation and cooking

- Recipe list page with filters and search
- Recipe detail page with ingredient analysis
- Recipe creation with AI generation
- Cooking flow with step-by-step guidance
- Pantry-based recipe recommendations
- Recipe tips and ratings
- Community recipes
- Save/favorite functionality" \
  "${RECIPE_FILES[@]}"

# ─────────────────────────────────────────────
# PR 5: feat/mealplan
# ─────────────────────────────────────────────
MEALPLAN_FILES=(
  "app/(pages)/meal-plans"
  "components/mealplan"
  "components/MealplanCard.tsx"
  "lib/mock/mealplanEntries.ts"
  "hooks/useGetMealplanEntries.ts"
  "hooks/useGetMealplanMacrosSummary.ts"
  "hooks/useCreateMealPlanEntry.ts"
  "hooks/useRemoveMealPlanEntry.ts"
  "hooks/useMarkMealplanRecipeAsCooked.ts"
  "hooks/useMarkActiveMealplanAsCompleated.ts"
  "hooks/useGetActiveUserPlan.ts"
  "hooks/useCancelActiveUserPlan.ts"
  "hooks/useGetDefaultSuggestedMealplans.ts"
  "hooks/useGetInfinitiveSuggestedMealplans.ts"
  "hooks/GetSuggestMealplansByCategory.tsx"
  "hooks/useSearchSuggestedMealplans.ts"
  "hooks/useGetSuggestedMealplanIngredients.ts"
  "hooks/useGetSuggestedMealplanRecipes.ts"
  "hooks/useGetSuggestedMealplansByUserMetrics.ts"
  "hooks/useGetMissingPlanPurchaseItems.ts"
  "hooks/useGetUserMealplanConfig.ts"
  "hooks/useCreateMealplanFromSuggestion.tsx"
)

create_branch "feat/mealplan" \
  "feat(mealplan): meal planning system

- Meal plan list and detail pages
- Suggested meal plans by category and user metrics
- Schedule recipes into meal plans
- Mark recipes as cooked
- Active plan management (activate, cancel, complete)
- Missing ingredients analysis
- Macro/nutrition summary
- Mock mealplan entries for development" \
  "${MEALPLAN_FILES[@]}"

# ─────────────────────────────────────────────
# PR 6: feat/purchases
# ─────────────────────────────────────────────
PURCHASE_FILES=(
  "app/(pages)/purchases"
  "components/purchases"
  "components/PurchaseNavbarMenu.tsx"
  "lib/context/purchase.tsx"
  "hooks/useGetPurchaseItems.ts"
  "hooks/useCreatePurchase.ts"
  "hooks/useConfirmPurchase.ts"
  "hooks/useGetUserPurchases.ts"
  "hooks/useSelectedPurchaseItems.ts"
  "hooks/useAddItemsToPurchaseOrder.ts"
  "hooks/useRemovePurchaseItem.ts"
  "hooks/useGetPantryPurchaseItems.ts"
  "hooks/usePurchaseItemsSelection.ts"
)

create_branch "feat/purchases" \
  "feat(purchases): shopping and purchase management

- Purchase order creation and confirmation
- Purchase history with order details
- Add ingredients to existing orders
- Pantry-based purchase suggestions
- Mealplan missing ingredients for shopping
- Purchase confirmation modal
- Purchase context for selection state" \
  "${PURCHASE_FILES[@]}"

# ─────────────────────────────────────────────
# PR 7: feat/social
# ─────────────────────────────────────────────
SOCIAL_FILES=(
  "app/(pages)/social"
  "components/social"
  "types/models/social.ts"
  "lib/mock/socialData.ts"
  "services/api/socialService.ts"
  "actions/social.ts"
  "hooks/social"
)

create_branch "feat/social" \
  "feat(social): social feed, profiles and gamification

- Social feed page with stories, posts, live activity
- Create posts with text/image/recipe
- Feed tabs: Para ti, Siguiendo, Popular
- User profile pages with stats and achievements
- Comment system with nested replies
- Follow/unfollow users
- Gamification: masteries, milestones, streaks, challenges
- Chef titles and weekly leagues
- Trending recipes and top chefs sidebar
- Social insights and notifications
- Full mock data for development" \
  "${SOCIAL_FILES[@]}"

# ─────────────────────────────────────────────
# PR 8: feat/tracking
# ─────────────────────────────────────────────
TRACKING_FILES=(
  "app/(pages)/tracking"
  "components/tracking"
  "hooks/useGetUserCookedRecipes.ts"
  "hooks/useGetUserNutricionalHistory.ts"
  "hooks/useGetUserNutritionalMetrics.ts"
  "hooks/useGetUserWeeklyNutritionalResume.ts"
  "hooks/useUpdateUserNutritionalMetrics.ts"
)

create_branch "feat/tracking" \
  "feat(tracking): nutrition tracking and monitoring

- Daily nutrition tracking page
- Horizontal calendar for date navigation
- Meal sections with recipe logging
- Nutrition summary (calories, protein, carbs, fats)
- Water intake tracker
- Add recipe modal for tracking
- Nutritional history and weekly resume
- Tracking onboarding flow" \
  "${TRACKING_FILES[@]}"

# ─────────────────────────────────────────────
# PR 9: feat/onboarding-settings
# ─────────────────────────────────────────────
ONBOARDING_FILES=(
  "app/onboarding"
  "components/onboarding"
  "lib/validation/onboarding.ts"
  "hooks/useOnboardingForm.ts"
  "app/(pages)/settings"
  "components/settings"
  "app/(pages)/user"
  "components/favorites"
  "hooks/useGetUserPreferences.ts"
  "hooks/useSetupUserPreferences.ts"
  "hooks/useUpdateUserPreferences.ts"
)

create_branch "feat/onboarding-settings" \
  "feat(onboarding/settings): user onboarding and settings

- Multi-step onboarding flow (body data, goals, food preferences)
- Zod validation schemas per step
- Settings page with profile, preferences, nutrition tabs
- User favorites and saved recipes pages
- User preferences management" \
  "${ONBOARDING_FILES[@]}"

# ─────────────────────────────────────────────
# Return to develop
# ─────────────────────────────────────────────
git checkout develop

echo ""
echo "========================================="
echo "✅ All feature branches created!"
echo "========================================="
echo ""
echo "Branches created:"
git branch --list "feat/*" | while read b; do echo "  $b"; done
echo ""
echo "Each branch is based on 'main' and contains only its feature files."
echo ""
echo "To create PRs, push each branch:"
echo "  git push origin feat/core-setup"
echo "  git push origin feat/home-page"
echo "  git push origin feat/pantry"
echo "  git push origin feat/recipes"
echo "  git push origin feat/mealplan"
echo "  git push origin feat/purchases"
echo "  git push origin feat/social"
echo "  git push origin feat/tracking"
echo "  git push origin feat/onboarding-settings"
echo ""
echo "Merge order (dependencies):"
echo "  1. feat/core-setup (base - merge first)"
echo "  2. All others can merge after core-setup"
