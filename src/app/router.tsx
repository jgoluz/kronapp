import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { MethodSelect } from '../features/brew/MethodSelect'
import { ProfileSelect } from '../features/brew/ProfileSelect'
import { Calculator } from '../features/brew/Calculator'
import { Timer } from '../features/timer/Timer'
import { Diagnosis } from '../features/diagnosis/Diagnosis'
import { Recipes } from '../features/recipes/Recipes'
import { NewRecipe } from '../features/recipes/NewRecipe'
import { Settings } from '../features/settings/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/brew" replace /> },
      { path: 'brew', element: <MethodSelect /> },
      { path: 'brew/profile/:methodId', element: <ProfileSelect /> },
      { path: 'brew/calculator', element: <Calculator /> },
      { path: 'timer', element: <Timer /> },
      { path: 'diagnosis', element: <Diagnosis /> },
      { path: 'recipes', element: <Recipes /> },
      { path: 'recipes/new', element: <NewRecipe /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])
