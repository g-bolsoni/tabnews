"use client";
import React from "react";
import useSWR from "swr";
import styles from "./status.module.css";

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
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Carregando status do sistema...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorScreen}>
        <p className={styles.errorText}>
          Erro ao carregar os dados. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.statusContainer}>
      <h1 className={styles.statusTitle}>Status do Sistema</h1>

      <div className={styles.statusCard}>
        <h2 className={styles.updateTitle}>Última atualização:</h2>
        <p className={styles.updateText}>
          {new Date(data.updated_at).toLocaleString()}
        </p>

        <h2 className={styles.dependenciesTitle}>Dependências</h2>
        <div className={styles.dependenciesGrid}>
          <div className={styles.dependencyCard}>
            <h3 className={styles.dependencyTitle}>Database</h3>
            <ul className={styles.dependencyList}>
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
