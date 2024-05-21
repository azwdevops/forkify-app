import { API_URL, RESULTS_PER_PAGE, API_KEY } from "./config.js";
import { AJAX } from "./helpers.js";

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (recipeId) {
  try {
    const data = await AJAX(`${API_URL}${recipeId}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some((bookmarkItem) => bookmarkItem.id === recipeId)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    throw error;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map((recipeItem) => {
      return {
        id: recipeItem.id,
        title: recipeItem.title,
        publisher: recipeItem.publisher,
        image: recipeItem.image_url,
        ...(recipeItem.key && { key: recipeItem.key }),
      };
    });
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ingredientItem) => {
    // newQuantity = oldQuantity * newServings / oldServings
    ingredientItem.quantity = (ingredientItem.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }
  // persist bookmarks
  persistBookmarks();
};

export const deleteBookmark = function (recipeId) {
  // delete bookmark
  const recipeIndex = state.bookmarks.findIndex((recipeItem) => recipeItem.id === recipeId);
  state.bookmarks.splice(recipeIndex, 1);
  // mark current recipe as not bookmarked
  if (state.recipe.id === recipeId) {
    state.recipe.bookmarked = false;
  }
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) {
    state.bookmarks = JSON.parse(storage);
  }
};

init();

const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map((ingredientItem) => {
        // const ingredientsArray = ingredientItem[1].replaceAll(" ", "").split(",");
        const ingredientsArray = ingredientItem[1].split(",").map((item) => item.trim());
        if (ingredientsArray.length !== 3) {
          throw new Error("Wrong ingredient format, please use the correct format");
        }
        const [quantity, unit, description] = ingredientsArray;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};
