import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL || "/";

export const adminApiCall = async (path: string, opts?: RequestInit) => {
  const url = `${BASE}api/admin${path}`;
  const r = await fetch(url.replace("//api", "/api"), {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || r.statusText);
  }
  // Check if response is JSON or something else (like CSV blob or empty)
  const contentType = r.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return r.json();
  }
  if (contentType && contentType.includes("text/csv")) {
    return r.blob();
  }
  return r.text();
};

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApiCall("/stats"),
  });
}

export function useAdminUsers(page = 1, limit = 50) {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: () => adminApiCall(`/users?page=${page}&limit=${limit}`),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApiCall(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => adminApiCall("/leads?type=contact"),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminApiCall(`/leads/${id}`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
  });
}

export function useAdminNewsletter() {
  return useQuery({
    queryKey: ["admin", "newsletter"],
    queryFn: () => adminApiCall("/newsletter"),
  });
}

export function useAdminBlogs() {
  return useQuery({
    queryKey: ["admin", "blogs"],
    queryFn: () => adminApiCall("/blogs"),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApiCall(`/blogs`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] }),
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApiCall(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiCall(`/blogs/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] }),
  });
}

export function useAdminWorkoutTemplates() {
  return useQuery({
    queryKey: ["admin", "workout-templates"],
    queryFn: () => adminApiCall("/workout-templates"),
  });
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApiCall(`/workout-templates`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "workout-templates"] }),
  });
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApiCall(`/workout-templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "workout-templates"] }),
  });
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiCall(`/workout-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "workout-templates"] }),
  });
}

export function useAdminDietTemplates() {
  return useQuery({
    queryKey: ["admin", "diet-templates"],
    queryFn: () => adminApiCall("/diet-templates"),
  });
}

export function useCreateDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApiCall(`/diet-templates`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "diet-templates"] }),
  });
}

export function useUpdateDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApiCall(`/diet-templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "diet-templates"] }),
  });
}

export function useDeleteDietTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApiCall(`/diet-templates/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "diet-templates"] }),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminApiCall("/settings"),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApiCall(`/settings`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}
