import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RootLayout    from '../components/layout/RootLayout';
import { ROUTES }    from '../constants/routes';

// Pages – semua masih placeholder, diisi bertahap
import Home         from '../pages/Home/Home';
import Login        from '../pages/Auth/Login/Login';
import Register     from '../pages/Auth/Register/Register';
import RecipeList   from '../pages/Recipes/RecipeList/RecipeList';
import RecipeDetail from '../pages/Recipes/RecipeDetail/RecipeDetail';
import MyRecipes    from '../pages/MyRecipes/MyRecipes';
import RecipeFormPage from '../pages/MyRecipes/RecipeFormPage';
import Favorites    from '../pages/Favorites/Favorites';
import MealPlanner  from '../pages/MealPlanner/MealPlanner';
import Tracker      from '../pages/Tracker/Tracker';
import Exercise     from '../pages/Exercise/Exercise';
import Profile      from '../pages/Profile/Profile';
import NotFound     from '../pages/NotFound/NotFound';

const P = (C) => <ProtectedRoute><C /></ProtectedRoute>;

export default createBrowserRouter([{
  path: ROUTES.HOME,
  element: <RootLayout />,
  children: [
    { index: true,                      element: <Home /> },
    { path: ROUTES.RECIPES,             element: <RecipeList /> },
    { path: ROUTES.RECIPE_DETAIL,       element: <RecipeDetail /> },
    { path: ROUTES.MY_RECIPES,          element: P(MyRecipes) },
    { path: ROUTES.MY_RECIPES_CREATE,   element: P(RecipeFormPage) },
    { path: ROUTES.MY_RECIPES_EDIT,     element: P(RecipeFormPage) },
    { path: ROUTES.FAVORITES,           element: P(Favorites) },
    { path: ROUTES.MEAL_PLANNER,        element: P(MealPlanner) },
    { path: ROUTES.TRACKER,             element: P(Tracker) },
    { path: ROUTES.EXERCISE,            element: P(Exercise) },
    { path: ROUTES.PROFILE,             element: P(Profile) },
    { path: ROUTES.LOGIN,               element: <Login /> },
    { path: ROUTES.REGISTER,            element: <Register /> },
    { path: '*',                        element: <NotFound /> },
  ],
}]);
