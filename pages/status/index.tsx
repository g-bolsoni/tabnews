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

const ScreenLoading = () => {
  return (
    <div className="p-6 bg-neutral-800 min-h-screen flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-5">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="text-neutral-200 mt-4">Carregando status do sistema...</p>
      </div>
    </div>
  );
};
const ScreenError = () => {
  return (
    <div className="p-6 bg-neutral-800 min-h-screen flex items-center justify-center">
      <p className="text-red-700 text-base font-bold text-center flex flex-col gap-2">
        <span> Erro ao carregar os dados.</span>
        <span>Por favor, tente novamente mais tarde.</span>
      </p>
    </div>
  );
};

const Status = () => {
  const { isLoading, data, error } = useSWR<IStatusData>(
    "/api/v1/status",
    fecthAPI,
    {
      refreshInterval: 10000,
    },
  );

  return (
    <>
      <div className="container mx-auto md:mt-6 p-6 mt-2">
        {isLoading ? (
          <ScreenLoading />
        ) : error || !data ? (
          <ScreenError />
        ) : (
          <div className="bg-neutral-800 min-h-screen">
            <h1 className="text-2xl font-bold text-neutral-200 mb-4">
              Status do Sistema
            </h1>

            <div className="bg-neutral-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl text-neutral-200 font-semibold mb-4">
                Última atualização:
              </h2>
              <p className="text-neutral-300 mb-6">
                {new Date(data.updated_at).toLocaleString()}
              </p>

              <h2 className="text-xl font-semibold mb-4 text-neutral-200">
                Dependências
              </h2>
              <div className="grid gap-6 md:grid-cols-2 grid-cols-1">
                <div className="bg-neutral-800 border border-solid border-neutral-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                    Database
                  </h3>
                  <ul className="text-neutral-200 ">
                    <li>
                      <strong className="font-bold">Versão: </strong>
                      {data.dependencies.database.version}
                    </li>
                    <li>
                      <strong className="font-bold">Conexões Máximas: </strong>
                      {data.dependencies.database.max_connections}
                    </li>
                    <li>
                      <strong className="font-bold">Conexões Abertas: </strong>
                      {data.dependencies.database.open_connections}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Status;
