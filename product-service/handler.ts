import "source-map-support/register";

import { getProductsList } from "./handlers/getProductsList";
import { getProductsById } from "./handlers/getProductsById";
import { addProduct } from "./handlers/addProduct";

export { getProductsList, getProductsById, addProduct };
