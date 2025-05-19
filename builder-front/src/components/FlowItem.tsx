"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  id: string;
  name: string | null;
};

export default function FlowItem({ id, name }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, _start] = useTransition();
  const [isEditing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name ?? "");

  /* --- Renommage ------------------------------------- */
  async function saveName() {
    await fetch(`/api/flows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draft }),
    });
    setEditing(false);
    router.refresh(); // refetch la page d'accueil
  }

  /* --- Suppression ----------------------------------- */
  async function remove() {
    if (!confirm("Supprimer ce flow ?")) return;
    await fetch(`/api/flows/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <li
      className="border rounded-xl p-3 hover:bg-gray-50 flex justify-between items-center gap-4"
    >
      {/* Bloc nom + lien */}
      <div className="flex-1">
        {isEditing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            autoFocus
            className="border-b outline-none bg-transparent"
            aria-label="Nom du flow"
          />
        ) : (
          <span
            className="cursor-pointer"
            onDoubleClick={() => setEditing(true)}
            title="Double-clic pour renommer"
          >
            {name || "Sans titre"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 text-sm">
        <Link
          href={`/flows/${id}`}
          className="text-blue-600 underline whitespace-nowrap"
        >
          Ouvrir
        </Link>
        <button
          onClick={() => setEditing(true)}
          disabled={isPending}
          title="Renommer"
        >
          ✏️
        </button>
        <button onClick={remove} disabled={isPending} title="Supprimer">
          🗑️
        </button>
      </div>
    </li>
  );
}
