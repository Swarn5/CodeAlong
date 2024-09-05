import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

type ProtectedRouteProps = {
  Page: React.ComponentType;
};

function ProtectedRoute({ Page }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);
  const loading = useSelector((state: any) => state.auth.loading);

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login');
    }
   
  }, [token, navigate, loading]);

  return <Page />;
}

export default ProtectedRoute;