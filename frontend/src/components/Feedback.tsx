export function Feedback({ error, message }: { error?: string; message?: string }) {
  return <>{error && <p className="feedback error" role="alert">{error}</p>}
    {message && <p className="feedback success" role="status">{message}</p>}</>;
}
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir a solicitação.';
