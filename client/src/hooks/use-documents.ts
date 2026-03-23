import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { documentsApi } from "@/lib/api/documents";

export function useDocuments(tripId: string | undefined) {
  return useQuery({
    queryKey: qk.trips.documents(tripId!),
    queryFn: () => documentsApi.list(tripId!),
    enabled: !!tripId,
  });
}

export function useUploadDocument(tripId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => documentsApi.upload(tripId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.trips.documents(tripId!) });
      queryClient.invalidateQueries({ queryKey: qk.trips.audit(tripId!) });
    },
  });
}

export function useUpdateDocument(tripId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      body,
    }: {
      docId: string;
      body: Record<string, string>;
    }) => documentsApi.update(tripId!, docId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.trips.documents(tripId!) });
      queryClient.invalidateQueries({ queryKey: qk.trips.audit(tripId!) });
    },
  });
}

export function useDeleteDocument(tripId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => documentsApi.delete(tripId!, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.trips.documents(tripId!) });
      queryClient.invalidateQueries({ queryKey: qk.trips.audit(tripId!) });
    },
  });
}
