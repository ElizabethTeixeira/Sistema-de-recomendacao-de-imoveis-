import React from 'react';

export const HistoricoVisitas: React.FC = () => {
  const visitas = [
    { id: 1, imovel: "Apartamento no Centro", data: "15/11/2026", horario: "14:00", status: "Agendado" },
    { id: 2, imovel: "Casa em Condomínio Zona Leste", data: "18/11/2026", horario: "09:30", status: "Em análise" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Meu Histórico de Visitas
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b text-gray-700 font-bold">Imóvel</th>
              <th className="p-3 border-b text-gray-700 font-bold">Data</th>
              <th className="p-3 border-b text-gray-700 font-bold">Horário</th>
              <th className="p-3 border-b text-gray-700 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {visitas.map((visita) => (
              <tr key={visita.id} className="hover:bg-gray-50">
                <td className="p-3 border-b text-gray-600">{visita.imovel}</td>
                <td className="p-3 border-b text-gray-600">{visita.data}</td>
                <td className="p-3 border-b text-gray-600">{visita.horario}</td>
                <td className="p-3 border-b font-medium text-blue-600">{visita.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};