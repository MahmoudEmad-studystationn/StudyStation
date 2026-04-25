// hooks/useLibrary.js
import { useState, useEffect, useCallback } from "react";

const BASE_URL = "https://study-station.runasp.net/api/Library";

export function useLibraryResource(id) {
  const [data, setData]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    fetch(`${BASE_URL}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { data, isLoading, error };
}

export function useAllLibraryResources() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/all`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setResources(Array.isArray(json) ? json : json.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { resources, isLoading, error };
}

export function useLibraryActions() {
  const addResource = useCallback(async (payload) => {
    const res = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  const updateResource = useCallback(async (id, payload) => {
    const res = await fetch(`${BASE_URL}/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  const approveResource = useCallback(async (id) => {
    const res = await fetch(`${BASE_URL}/approve/${id}`, { method: "PUT" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  const rejectResource = useCallback(async (id) => {
    const res = await fetch(`${BASE_URL}/reject/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  return { addResource, updateResource, approveResource, rejectResource };
}