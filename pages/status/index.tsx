"use client";
import React from "react";
import useSWR from "swr";

const fecthAPI = async (key: string) => {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
};

export interface IStatusData {
  updated_at: string;
  dependencies: Dependencies;
}

export interface Dependencies {
  database: Database;
}

export interface Database {
  version: string;
  max_connections: number;
  open_connections: number;
}

const Status = () => {
  const { isLoading, data, error } = useSWR<IStatusData>(
    "/api/v1/status",
    fecthAPI,
    {
      refreshInterval: 10000,
    },
  );
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Carregando status do sistema...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Erro ao carregar os dados. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Status do Sistema
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Última atualização:</h2>
        <p className="text-gray-700 mb-6">
          {new Date(data.updated_at).toLocaleString()}
        </p>

        <h2 className="text-xl font-semibold mb-4">Dependências</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-500 mb-2">
              Database
            </h3>
            <ul className="text-gray-700">
              <li>
                <strong>Versão:</strong> {data.dependencies.database.version}
              </li>
              <li>
                <strong>Conexões Máximas:</strong>
                {data.dependencies.database.max_connections}
              </li>
              <li>
                <strong>Conexões Abertas:</strong>
                {data.dependencies.database.open_connections}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
