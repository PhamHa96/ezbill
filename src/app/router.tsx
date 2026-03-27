import { createBrowserRouter } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { LoginPage } from "../features/auth/LoginPage";
import { SignUpPage } from "../features/auth/SignUpPage";
import HomePage from "../features/home/HomePage";
import AppLayout from "../features/AppLayout";
import { CreateExpensePage } from "../features/expense-creation/CreateExpensePage";
import { TripsListPage } from "../features/trips/TripsListPage";
import { TripDetailPage } from "../features/trips/TripDetailPage";
import { FriendsPage } from "../features/friends/FriendsPage";
import { ProfilePage } from "../features/profile/ProfilePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpPage /> },
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "trips", element: <TripsListPage /> },
      { path: "trips/:id", element: <TripDetailPage /> },
      { path: "friends", element: <FriendsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "expense/create", element: <CreateExpensePage /> },
    ],
  },
]);
