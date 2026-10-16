import { useEffect, useState } from 'react';
import type { Api } from '../services/api.ts';
import type { Content, ContentFilters } from '../services/types.ts';
import { Feedback, errorMessage } from '../components/Feedback.tsx';

const pageSize = 12;
export function ContentPage({ api }: { api: Api }) {
  const [items, setItems] = useState<Content[]>([]);
  const [selected, setSelected] = useState<Content | null>(null);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setSelected(null); setError('');
    api.listContent(filters, pageSize + 1, offset).then(({ data }) => {
      if (active) { setItems(data.slice(0, pageSize)); setHasNext(data.length > pageSize); }
    }).catch(error => { if (active) setError(errorMessage(error)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, filters, offset, revision]);
  async function open(id: string) {
    setBusy(true); setError(''); setSelected(null);
    try { setSelected((await api.getContent(id)).data); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <section className="card"><h2>Conteúdos</h2><p>Explore os materiais disponíveis para seu plano.</p>
    <form onSubmit={event => {
      event.preventDefault(); const values = new FormData(event.currentTarget), next: ContentFilters = {};
      const category = String(values.get('category')).trim(), difficulty = String(values.get('difficulty')).trim(), type = String(values.get('type'));
      if (category) next.category = category;
      if (difficulty) next.difficulty = difficulty;
      if (type === 'article' || type === 'video') next.type = type;
      setFilters(next); setOffset(0);
    }}><fieldset disabled={loading || busy}><div className="form-grid">
      <label>Categoria<input name="category" maxLength={100} placeholder="Todas as categorias" /></label>
      <label>Formato<select name="type"><option value="">Todos</option><option value="article">Artigo</option><option value="video">Vídeo</option></select></label>
      <label>Dificuldade<input name="difficulty" maxLength={100} placeholder="Todas" /></label>
    </div><button type="submit">Filtrar conteúdos</button></fieldset></form>
    <Feedback error={error} />{error && <button className="secondary" disabled={busy || loading} onClick={() => setRevision(value => value + 1)}>Tentar novamente</button>}
    {loading ? <p role="status">Carregando conteúdos…</p> : <>
      {!items.length && !error && <p className="empty">Nenhum conteúdo encontrado para estes filtros.</p>}
      <div className="content-grid">{items.map(item => <article key={item.id} className="content-card">
        <span className="badge">{item.type === 'article' ? 'Artigo' : 'Vídeo'}{item.isPremium ? ' · Premium' : ''}</span>
        <h3>{item.title}</h3><p>{item.category}{item.difficulty ? ` · ${item.difficulty}` : ''}</p>
        {item.locked ? <p>Disponível no plano Premium.</p> : <button className="secondary" disabled={busy} onClick={() => open(item.id)}>Abrir conteúdo</button>}
      </article>)}</div>
      <nav className="pagination" aria-label="Paginação dos conteúdos"><button className="secondary" disabled={busy || offset === 0} onClick={() => setOffset(offset - pageSize)}>Anterior</button>
        <span>Página {Math.floor(offset / pageSize) + 1}</span><button className="secondary" disabled={busy || !hasNext || Boolean(error)} onClick={() => setOffset(offset + pageSize)}>Próxima</button></nav>
    </>}
    {busy && <p role="status">Abrindo conteúdo…</p>}
    {selected && <article className="content-detail" aria-label="Conteúdo selecionado"><div className="section-heading"><h2>{selected.title}</h2>
      <button className="secondary" onClick={() => setSelected(null)}>Fechar</button></div>
      {selected.locked ? <p>Disponível no plano Premium.</p> : <>
        {selected.textContent && <p className="article-text">{selected.textContent}</p>}
        {selected.url && /^https:\/\//i.test(selected.url) && <a href={selected.url} target="_blank" rel="noopener noreferrer">Assistir ao vídeo em outra aba</a>}
      </>}
    </article>}
  </section>;
}
