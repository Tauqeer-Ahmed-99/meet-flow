import { PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const { isSignedIn } = useUser();
  const { pathname } = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (pathname.startsWith("/meeting") && !isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [pathname, isSignedIn]);

  return <>{children}</>;
};

export default AuthProvider;
