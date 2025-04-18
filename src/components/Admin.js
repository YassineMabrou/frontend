import { useContext, useEffect, useState } from "react";
import { fetchAdminData } from "../api/auth";
import { AuthContext } from "../context/AuthContext";

const Admin = () => {
  const { token, user } = useContext(AuthContext);
  const [data, setData] = useState("");

  useEffect(() => {
    if (user.role === "admin") {
      fetchAdminData(token)
        .then((res) => setData(res.data.message))
        .catch((err) => console.error(err));
    }
  }, [token, user]);

  if (user.role !== "admin") {
    return <p>Access denied</p>;
  }

  return <p>{data}</p>;
};

export default Admin;
