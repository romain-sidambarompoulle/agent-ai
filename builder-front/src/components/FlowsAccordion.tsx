'use client';

import { useState } from 'react';
// import Link from 'next/link'; // Supprimé car FlowItem gère le lien
import FlowItem from './FlowItem'; // Ajout de l'importation de FlowItem

type Flow = { id: string; name?: string | null }; // name peut être null

interface FlowsAccordionProps {
  flows: Flow[];
}

export default function FlowsAccordion({ flows }: FlowsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition focus:outline-none"
      >
        <span className="font-semibold">
          {flows.length > 0 ? `Afficher les ${flows.length} flow(s) existant(s)` : 'Aucun flow enregistré'}
        </span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && flows.length > 0 && (
        <ul className="mt-2 space-y-2">
          {flows.map(({ id, name }) => (
            // Utilisation de FlowItem ici
            <FlowItem key={id} id={id} name={name ?? null} />
          ))}
        </ul>
      )}
      {isOpen && flows.length === 0 && (
         <p className="text-center text-gray-500 mt-2">
            Aucun flow enregistré pour l&rsquo;instant.
         </p>
      )}
    </div>
  );
}
