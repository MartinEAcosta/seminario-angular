import { Options } from "@course/services/course.service";

export const obtainOptionsParams = ( options : Options ) : Options => {
  let params = {
    current_page : options?.page ?? 1,
    limit : options?.limit ?? 10,
  };

  return {
    ...params,
    ...( options.title && { title : options.title.toLowerCase().trim() } ),
    ...( options.id_category && { id_category : options.id_category } ),
    ...( options.minPrice && { minPrice : options.minPrice } ),
    ...( options.maxPrice && { maxPrice : options.maxPrice } ),
    ...( options.notFullyEnrolled && { notFullyEnrolled : options.notFullyEnrolled } ),
  };
}