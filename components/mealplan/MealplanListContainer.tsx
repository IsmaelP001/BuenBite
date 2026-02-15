import SearchResultsMealplans from "./SearchResultsMealplans";
import MealplanListByCategory from "./MealplanListByCategory";


interface MealplanListContainerProps{
  searchParams:Record<string,string>
}

export default function MealplanListContainer({searchParams}:MealplanListContainerProps) {

  return (
    <section>
      {searchParams?.query || searchParams?.category ? (
        <SearchResultsMealplans query={searchParams?.query ?? ""} category={searchParams?.category ?? ""} />
      ) : (
        <MealplanListByCategory  />
      )}
    </section>
  );
}
