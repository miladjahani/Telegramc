import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile, deleteMessages } from '../lib/telegram';

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, entity = 'me', onProgress }: { file: File; entity?: any; onProgress?: (p: number) => void }) => uploadFile(file, entity, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId }: { messageId: number }) => deleteMessages('me', [messageId]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });
}