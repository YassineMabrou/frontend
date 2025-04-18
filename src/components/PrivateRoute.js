import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";  // Import your context

const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { user } = useContext(AuthContext);  // Get the logged-in user from context

  return (
    <Route
      {...rest}
      render={(props) =>
        user && allowedRoles.includes(user.role) ? (  // Check if user has permission
          <Component {...props} />  // If authorized, render the component
        ) : (
          <Redirect to="/" />  // If unauthorized, redirect to home/login page
        )
      }
    />
  );
};

export default PrivateRoute;
