import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG, CATEGORIAS, MENU, brl, loadMenu, saveMenu, clearMenu, novoId, supabaseEnabled, rowToItem, itemToRow } from './data'
import { supabase } from './supabase'
import logo from './assets/logo.png'

/* ------------------------------- Ícones ------------------------------- */
const I = {
  wa: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.815-1.001a9.87 9.87 0 001.162.394z"/><path d="M9.16 6.958c-.223-.494-.457-.504-.669-.513l-.57-.007c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.36 5.177 4.57 2.559 1.006 3.081.806 3.637.756.556-.05 1.793-.733 2.046-1.44.25-.708.25-1.314.174-1.441-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.966-.94 1.164-.174.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.174-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.496.099-.199.05-.372-.025-.521-.074-.149-.652-1.62-.916-2.209z"/></svg>
  ),
  plus: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  cart: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="21" r="1.6"/><circle cx="19" cy="21" r="1.6"/><path d="M2.5 3h2l2.2 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/></svg>),
  pin: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  clock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  up: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 19V6M6 12l6-6 6 6"/></svg>),
}

/* ------------------------------- Brasas ------------------------------- */
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 7 + 4) % 100,
  delay: (i % 7) * 0.6,
  dur: 4 + (i % 5) * 0.8,
  size: 3 + (i % 3) * 1.5,
}))

/* =============================== APP =============================== */
export default function App() {
  const [menu, setMenu] = useState(loadMenu)
  const [route, setRoute] = useState(() => {
    try { return (window.location.hash || '').replace('#', '') } catch { return '' }
  })

  useEffect(() => {
    const onHash = () => setRoute((window.location.hash || '').replace('#', ''))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Cardápio ao vivo do Supabase (com atualização em tempo real). Se não configurado, usa o local.
  useEffect(() => {
    if (!supabaseEnabled() || !supabase) return
    let active = true
    const fetchMenu = async () => {
      const { data, error } = await supabase.from('produtos').select('*').order('ordem', { ascending: true })
      if (!error && active && Array.isArray(data) && data.length) setMenu(data.map(rowToItem))
    }
    fetchMenu()
    const ch = supabase
      .channel('produtos-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, fetchMenu)
      .subscribe()
    return () => { active = false; supabase.removeChannel(ch) }
  }, [])

  if (route === 'admin') {
    return <Admin menu={menu} setMenu={setMenu} onExit={() => { window.location.hash = '' }} />
  }
  return <Loja menu={menu} />
}

/* =============================== LOJA (cliente) =============================== */
function Loja({ menu }) {
  const [cart, setCart] = useState({}) // { [id]: qty }
  const [notes, setNotes] = useState({}) // { [id]: observação do item }
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(CATEGORIAS[0].id)
  const [stuck, setStuck] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const items = useMemo(
    () => menu.map((m) => ({ ...m, qty: cart[m.id] || 0 })).filter((m) => m.qty > 0),
    [cart, menu]
  )
  const cats = useMemo(
    () => CATEGORIAS.filter((c) => menu.some((m) => m.cat === c.id)),
    [menu]
  )
  const totalQty = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart])
  const subtotal = useMemo(() => items.reduce((a, m) => a + m.preco * m.qty, 0), [items])

  const toast = useCallback((msg) => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1900)
  }, [])

  const add = useCallback((m) => {
    setCart((c) => ({ ...c, [m.id]: (c[m.id] || 0) + 1 }))
    toast(`${m.nome} adicionado`)
  }, [toast])
  const clearNote = (id) => setNotes((n) => { if (!(id in n)) return n; const next = { ...n }; delete next[id]; return next })
  const dec = useCallback((id) => {
    setCart((c) => {
      const n = (c[id] || 0) - 1
      const next = { ...c }
      if (n <= 0) { delete next[id]; clearNote(id) }
      else next[id] = n
      return next
    })
  }, [])
  const remove = useCallback((id) => { setCart((c) => { const n = { ...c }; delete n[id]; return n }); clearNote(id) }, [])
  const setNote = useCallback((id, text) => setNotes((n) => ({ ...n, [id]: text })), [])

  /* scroll spy + sticky shadow */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    CATEGORIAS.forEach((c) => { const el = document.getElementById(c.id); if (el) obs.observe(el) })
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setStuck(y > 220)
      setShowTop(y > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const goTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 58
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // trava a rolagem do fundo quando o checkout está aberto (evita "scroll fantasma")
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div className="bg-fx" />

      {/* HERO */}
      <header className="hero">
        <div className="hero-glow" />
        <div className="embers">
          {EMBERS.map((e, i) => (
            <span key={i} className="ember" style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }} />
          ))}
        </div>
        <motion.img
          src={logo} alt="Gordin Lanches" className="logo"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        />
        <motion.div className="hero-tags"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
          <span className="chip hot">🔥 {CONFIG.slogan}</span>
          <span className="chip"><I.pin /> {CONFIG.endereco}</span>
          <span className="chip">🛵 Delivery • Retirada • No local</span>
        </motion.div>
      </header>

      {/* NAV */}
      <nav className={`nav ${stuck ? 'stuck' : ''}`}>
        <div className="nav-inner">
          {cats.map((c) => (
            <button key={c.id} className={`pill ${active === c.id ? 'active' : ''}`} onClick={() => goTo(c.id)}>
              <span className="emo">{c.icone}</span> {c.nome}
            </button>
          ))}
        </div>
      </nav>

      {/* MENU */}
      <main className="wrap">
        {cats.map((c) => {
          const list = menu.filter((m) => m.cat === c.id)
          return (
            <section key={c.id} id={c.id} className={`section ${c.id}`}>
              <div className="section-head">
                <span className="bar" />
                <h2>{c.nome}{c.id === 'combos' ? ' • 3 Unid.' : c.id === 'hotdogs' ? ' Prensado' : ''}</h2>
                <span className="count">{list.length} opções</span>
              </div>
              <div className="grid">
                {list.map((m, i) => (
                  <Card key={m.id} m={m} qty={cart[m.id] || 0} onAdd={() => add(m)} onDec={() => dec(m.id)} index={i} />
                ))}
              </div>
            </section>
          )
        })}
        <div className="spacer" />
      </main>

      {/* RODAPÉ */}
      <footer className="foot">
        <div className="info">
          <a href={`https://wa.me/${CONFIG.whatsapp}`} target="_blank" rel="noreferrer"><I.wa /> {formatPhone(CONFIG.whatsapp)}</a>
          <span><I.pin /> {CONFIG.endereco}</span>
        </div>
        <div>{CONFIG.nome} — {CONFIG.slogan}</div>
        <div className="made">Peça em poucos toques • pedido enviado direto no WhatsApp</div>
        <div className="made" style={{ marginTop: 10 }}>
          <a href="#admin" style={{ color: 'var(--muted-2)', textDecoration: 'none', borderBottom: '1px dotted var(--muted-2)' }}>Administração</a>
        </div>
      </footer>

      {/* BARRA CARRINHO */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div className="cartbar"
            initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
            <div className="cartbar-inner">
              <div className="cart-icon-wrap">
                <I.cart />
                <motion.span key={totalQty} className="badge" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>{totalQty}</motion.span>
              </div>
              <div className="cart-meta">
                <span className="c">{totalQty} {totalQty === 1 ? 'item' : 'itens'}</span>
                <motion.span key={subtotal} className="t" initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }}>{brl(subtotal)}</motion.span>
              </div>
              <button className="checkout" onClick={() => setOpen(true)}><I.wa /> Finalizar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOASTS */}
      <div className="toast-zone">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} className="toast"
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <span className="dot">✓</span> {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* VOLTAR AO TOPO */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            className={`to-top ${totalQty > 0 ? 'raised' : ''}`}
            onClick={toTop} aria-label="Voltar ao topo"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
            whileTap={{ scale: 0.88 }}
          >
            <I.up />
          </motion.button>
        )}
      </AnimatePresence>

      {/* CHECKOUT */}
      <AnimatePresence>
        {open && (
          <Checkout
            items={items} subtotal={subtotal} notes={notes}
            onClose={() => setOpen(false)} onAdd={add} onDec={dec} onRemove={remove} onNote={setNote}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* =============================== CARD =============================== */
function Card({ m, qty, onAdd, onDec, index }) {
  return (
    <motion.div
      className={`card ${m.destaque ? 'destaque' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35) }}
    >
      <div className="card-top">
        <span className="card-name">{m.nome}</span>
      </div>
      <p className="card-desc">{m.desc}</p>
      <div className="card-foot">
        <span className="price"><small>R$</small>{m.preco.toFixed(2).replace('.', ',')}</span>
        {qty > 0 ? (
          <div className="stepper">
            <button onClick={onDec} aria-label="Remover um">−</button>
            <span className="qty">{qty}</span>
            <button onClick={onAdd} aria-label="Adicionar um">+</button>
          </div>
        ) : (
          <motion.button className="add" onClick={onAdd} whileTap={{ scale: 0.9 }}>
            <I.plus /> Pedir
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

/* ============================= CHECKOUT ============================= */
function Checkout({ items, subtotal, notes, onClose, onAdd, onDec, onRemove, onNote }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('Delivery')
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [complemento, setComplemento] = useState('')
  const [cepStatus, setCepStatus] = useState('idle') // idle | loading | ok | error
  const numeroRef = useRef(null)
  const [pagamento, setPagamento] = useState('PIX')
  const [troco, setTroco] = useState('')
  const [obs, setObs] = useState('')
  const [copiado, setCopiado] = useState(false)

  const taxa = tipo === 'Delivery' ? (CONFIG.taxaEntrega || 0) : 0
  const total = subtotal + taxa
  const precisaEndereco = tipo === 'Delivery'
  const valido = nome.trim() && items.length > 0 && (!precisaEndereco || (rua.trim() && numero.trim()))

  const onCep = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    setCep(digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits)
    if (digits.length === 8) buscaCep(digits)
    else if (cepStatus !== 'idle') setCepStatus('idle')
  }

  const buscaCep = async (digits) => {
    setCepStatus('loading')
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const d = await r.json()
      if (d.erro) { setCepStatus('error'); return }
      setRua(d.logradouro || '')
      setBairro(d.bairro || '')
      setCidade(d.localidade || '')
      setUf(d.uf || '')
      setCepStatus('ok')
      setTimeout(() => numeroRef.current && numeroRef.current.focus(), 60)
    } catch {
      setCepStatus('error') // offline ou API fora do ar -> segue preenchimento manual
    }
  }

  const copiarPix = () => {
    try { navigator.clipboard.writeText(CONFIG.pix) } catch { /* noop */ }
    setCopiado(true); setTimeout(() => setCopiado(false), 1600)
  }

  const enviar = (e) => {
    e.preventDefault()
    if (!valido) return
    let msg = `*NOVO PEDIDO — ${CONFIG.nome.toUpperCase()}*\n\n`
    msg += `*Cliente:* ${nome.trim()}\n`
    msg += `*Tipo:* ${tipo}\n`
    if (precisaEndereco) {
      let end = `${rua.trim()}, ${numero.trim()}`
      if (complemento.trim()) end += ` (${complemento.trim()})`
      if (bairro.trim()) end += ` - ${bairro.trim()}`
      if (cidade.trim()) end += `, ${cidade.trim()}${uf.trim() ? '/' + uf.trim() : ''}`
      if (cep.trim()) end += ` - CEP ${cep.trim()}`
      msg += `*Endereço:* ${end}\n`
    }
    msg += `\n*ITENS:*\n`
    items.forEach((m) => {
      msg += `• ${m.qty}x ${m.nome} — ${brl(m.preco * m.qty)}\n`
      const nt = ((notes && notes[m.id]) || '').trim()
      if (nt) msg += `    ↳ Obs: ${nt}\n`
    })
    msg += `\n*Subtotal:* ${brl(subtotal)}\n`
    if (taxa > 0) msg += `*Taxa de entrega:* ${brl(taxa)}\n`
    msg += `*TOTAL:* ${brl(total)}\n\n`
    msg += `*Pagamento:* ${pagamento}\n`
    if (pagamento === 'Dinheiro' && troco.trim()) msg += `*Troco para:* ${troco.trim()}\n`
    if (pagamento === 'PIX' && CONFIG.pix) msg += `*Chave PIX:* ${CONFIG.pix}\n`
    if (obs.trim()) msg += `*Obs.:* ${obs.trim()}\n`
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={enviar}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
        <div className="grabber" />
        <div className="sheet-head">
          <h3>Seu Pedido</h3>
          <button type="button" className="x" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {items.length === 0 ? (
          <div className="empty"><div className="big">🛒</div><p>Seu carrinho está vazio.</p></div>
        ) : (
          <div className="mlist">
            {items.map((m) => (
              <div className="mitem" key={m.id}>
                <div className="mrow">
                  <div className="info">
                    <div className="nm">{m.nome}</div>
                    <div className="pr">{brl(m.preco)} cada</div>
                  </div>
                  <div className="mini">
                    <button type="button" onClick={() => onDec(m.id)} aria-label="Menos">−</button>
                    <span className="q">{m.qty}</span>
                    <button type="button" onClick={() => onAdd(m)} aria-label="Mais">+</button>
                  </div>
                  <div className="line-total">{brl(m.preco * m.qty)}</div>
                  <button type="button" className="mini" onClick={() => onRemove(m.id)} aria-label="Remover item" style={{ padding: '6px 8px' }}><span className="rm">🗑</span></button>
                </div>
                <input
                  className="mitem-obs"
                  value={(notes && notes[m.id]) || ''}
                  onChange={(e) => onNote(m.id, e.target.value)}
                  placeholder={`Obs. do ${m.nome} — ex.: sem cebola, ponto da carne...`}
                  aria-label={`Observação para ${m.nome}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="field">
          <label>Seu nome <span className="req">*</span></label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: João Silva" required />
        </div>

        <div className="field">
          <label>Como você quer receber? <span className="req">*</span></label>
          <div className="seg">
            {[['Delivery', '🛵'], ['Retirada', '🛍️'], ['Comer no local', '🍽️']].map(([t, e]) => (
              <button type="button" key={t} className={tipo === t ? 'on' : ''} onClick={() => setTipo(t)}>
                <span className="e">{e}</span>{t}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {precisaEndereco && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div className="field">
                <label>CEP <span style={{ color: 'var(--muted-2)', fontWeight: 500 }}>— preenche o endereço automaticamente</span></label>
                <div className="cep-row">
                  <input inputMode="numeric" value={cep} onChange={onCep} placeholder="00000-000" maxLength={9} aria-label="CEP" />
                  {cepStatus === 'loading' && <span className="cep-status load">buscando…</span>}
                  {cepStatus === 'ok' && <span className="cep-status ok">✓ endereço encontrado</span>}
                  {cepStatus === 'error' && <span className="cep-status err">CEP não localizado — preencha abaixo</span>}
                </div>
              </div>

              <div className="field">
                <label>Rua <span className="req">*</span></label>
                <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Nome da rua / avenida" required={precisaEndereco} />
              </div>

              <div className="row-num">
                <div className="field">
                  <label>Número <span className="req">*</span></label>
                  <input ref={numeroRef} inputMode="numeric" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" required={precisaEndereco} />
                </div>
                <div className="field">
                  <label>Bairro</label>
                  <input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
                </div>
              </div>

              <div className="row-city">
                <div className="field">
                  <label>Cidade</label>
                  <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" />
                </div>
                <div className="field">
                  <label>UF</label>
                  <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" />
                </div>
              </div>

              <div className="field">
                <label>Complemento / ponto de referência</label>
                <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, bloco, próximo a..." />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="field">
          <label>Forma de pagamento <span className="req">*</span></label>
          <div className="seg">
            {[['PIX', '📱'], ['Cartão', '💳'], ['Dinheiro', '💵']].map(([t, e]) => (
              <button type="button" key={t} className={pagamento === t ? 'on' : ''} onClick={() => setPagamento(t)}>
                <span className="e">{e}</span>{t}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {pagamento === 'Dinheiro' && (
            <motion.div className="field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <label>Precisa de troco? (opcional)</label>
              <input value={troco} onChange={(e) => setTroco(e.target.value)} placeholder="Ex.: troco para R$ 50,00" />
            </motion.div>
          )}
          {pagamento === 'PIX' && CONFIG.pix && (
            <motion.div className="field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div className="pix-box">
                <span className="k">{CONFIG.pix}</span>
                <button type="button" onClick={copiarPix}>{copiado ? 'Copiado!' : 'Copiar chave'}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="field">
          <label>Observações gerais do pedido (opcional)</label>
          <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Ex.: entregar na portaria, tocar a campainha..." />
        </div>

        <div className="totals">
          <div className="totrow"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
          {taxa > 0 && <div className="totrow"><span>Taxa de entrega</span><span>{brl(taxa)}</span></div>}
          {tipo === 'Delivery' && taxa === 0 && <div className="totrow"><span>Taxa de entrega</span><span>a combinar</span></div>}
          <div className="totrow grand"><span>Total</span><span>{brl(total)}</span></div>
        </div>

        <button type="submit" className="send" disabled={!valido}>
          <I.wa /> Enviar pedido no WhatsApp
        </button>
      </motion.form>
    </motion.div>
  )
}

/* =============================== ADMIN =============================== */
function Admin({ menu, setMenu, onExit }) {
  const online = supabaseEnabled()
  const [ok, setOk] = useState(false)
  const [login, setLogin] = useState('') // offline: login | online: e-mail
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState('')

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(''), 2600) }

  // Sessão já ativa no Supabase -> entra direto
  useEffect(() => {
    if (!online || !supabase) return
    supabase.auth.getSession().then(({ data }) => { if (data && data.session) setOk(true) })
  }, [online])

  const entrar = async (e) => {
    e.preventDefault()
    setErr('')
    if (online) {
      setBusy(true)
      const { error } = await supabase.auth.signInWithPassword({ email: login.trim(), password: pw })
      setBusy(false)
      if (error) setErr('E-mail ou senha incorretos.')
      else setOk(true)
    } else {
      const loginOk = login.trim().toUpperCase() === String(CONFIG.adminLogin).toUpperCase()
      if (loginOk && pw === CONFIG.adminSenha) setOk(true)
      else setErr('Login ou senha incorretos.')
    }
  }

  const sair = async () => { if (online && supabase) await supabase.auth.signOut(); setOk(false) }

  const upd = (id, patch) => setMenu((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  const del = (id) => setMenu((list) => list.filter((m) => m.id !== id))
  const add = (cat) => {
    const id = novoId()
    setMenu((list) => [...list, { id, cat, nome: '', desc: '', preco: 0 }])
    setTimeout(() => { const el = document.getElementById('p-' + id); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); const inp = el.querySelector('input'); if (inp) inp.focus() } }, 60)
  }

  // Publicar: online -> grava no banco (ao vivo p/ todos); offline -> salva neste aparelho
  const salvar = async () => {
    if (!online) { flash(saveMenu(menu) ? '✓ Alterações salvas neste aparelho' : '⚠ Não foi possível salvar localmente (mas o download funciona)'); return }
    setBusy(true)
    try {
      const rows = menu.map((m, i) => itemToRow(m, i))
      const ids = rows.map((r) => r.id)
      if (rows.length) {
        const { error } = await supabase.from('produtos').upsert(rows, { onConflict: 'id' })
        if (error) throw error
      }
      let delq = supabase.from('produtos').delete()
      delq = ids.length
        ? delq.not('id', 'in', '(' + ids.map((id) => '"' + id + '"').join(',') + ')')
        : delq.neq('id', '__none__')
      const { error: e2 } = await delq
      if (e2) throw e2
      flash('✓ Publicado ao vivo! Os clientes já veem as mudanças.')
    } catch (er) {
      flash('⚠ Erro ao publicar: ' + ((er && er.message) || 'tente novamente'))
    } finally { setBusy(false) }
  }

  const restaurar = () => {
    if (window.confirm('Restaurar o cardápio padrão? Suas edições locais serão apagadas.')) {
      clearMenu(); setMenu(MENU.map((m) => ({ ...m }))); flash('Cardápio padrão restaurado')
    }
  }

  const baixar = () => {
    saveMenu(menu)
    try {
      const clone = document.documentElement.cloneNode(true)
      clone.querySelectorAll('script[data-gordin-seed]').forEach((n) => n.remove())
      const root = clone.querySelector('#root'); if (root) root.innerHTML = ''
      const seed = document.createElement('script')
      seed.setAttribute('data-gordin-seed', '')
      seed.textContent = 'window.__GORDIN_MENU__=' + JSON.stringify(menu) + ';'
      const head = clone.querySelector('head'); if (head) head.prepend(seed)
      const html = '<!doctype html>\n' + clone.outerHTML
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'gordin-lanches.html'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)
      flash('⬇ Arquivo baixado — suba no Netlify para publicar')
    } catch {
      flash('⚠ Falha ao gerar o arquivo neste navegador')
    }
  }

  if (!ok) {
    return (
      <div className="admin-gate">
        <div className="bg-fx" />
        <motion.form className="gate-card" onSubmit={entrar} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <img src={logo} alt="Gordin" style={{ width: 150, margin: '0 auto 6px' }} />
          <h2>Painel de Administração</h2>
          <p className="gate-sub">{online ? 'Entre com seu e-mail e senha de administrador.' : 'Acesso restrito ao dono da loja.'}</p>
          <input
            type={online ? 'email' : 'text'} value={login} autoFocus
            autoComplete={online ? 'email' : 'username'} autoCapitalize={online ? 'off' : 'characters'}
            onChange={(e) => { setLogin(e.target.value); setErr('') }}
            placeholder={online ? 'E-mail' : 'Login'}
          />
          <input type="password" value={pw} autoComplete="current-password" onChange={(e) => { setPw(e.target.value); setErr('') }} placeholder="Senha" />
          {err && <div className="gate-err">{err}</div>}
          <button type="submit" className="btn-fire" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
          <a href="#" onClick={onExit} className="gate-back">← Voltar ao cardápio</a>
        </motion.form>
      </div>
    )
  }

  const total = menu.length

  return (
    <div className="admin">
      <div className="bg-fx" />
      <header className="admin-head">
        <div className="wrap admin-head-in">
          <div>
            <div className="admin-title">Painel do Gordin</div>
            <div className="admin-sub">{total} produtos no cardápio</div>
          </div>
          <a href="#" onClick={onExit} className="btn-ghost">👁 Ver cardápio</a>
        </div>
      </header>

      <div className="wrap">
        <div className="admin-actions">
          <button className="btn-fire" onClick={salvar} disabled={busy}>{online ? (busy ? '⏳ Publicando…' : '🚀 Publicar ao vivo') : '💾 Salvar'}</button>
          {!online && <button className="btn-wa" onClick={baixar}>⬇ Baixar site para publicar</button>}
          {!online && <button className="btn-ghost" onClick={restaurar}>↺ Restaurar padrão</button>}
          {online && <button className="btn-ghost" onClick={sair}>⎋ Sair</button>}
        </div>
        <AnimatePresence>
          {saved && <motion.div className="admin-flash" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{saved}</motion.div>}
        </AnimatePresence>

        <div className="admin-note">
          {online ? (
            <>Edite à vontade e clique em <b>Publicar ao vivo</b>. As mudanças vão para o banco de dados
            e aparecem <b>na hora</b> para todos os clientes — sem baixar nem subir arquivo.</>
          ) : (
            <>As mudanças aparecem na hora aqui e ficam salvas neste aparelho. Para os clientes verem,
            clique em <b>Baixar site para publicar</b> e suba o arquivo no seu hospedeiro.</>
          )}
        </div>

        {CATEGORIAS.map((c) => {
          const list = menu.filter((m) => m.cat === c.id)
          return (
            <section key={c.id} className="admin-cat">
              <div className="admin-cat-head">
                <h3>{c.icone} {c.nome} <span>({list.length})</span></h3>
                <button className="btn-add" onClick={() => add(c.id)}>＋ Adicionar em {c.nome}</button>
              </div>
              {list.length === 0 && <div className="admin-empty">Nenhum produto nesta categoria.</div>}
              {list.map((m) => (
                <div className="prod" id={'p-' + m.id} key={m.id}>
                  <div className="prod-main">
                    <input className="prod-nome" value={m.nome} onChange={(e) => upd(m.id, { nome: e.target.value })} placeholder="Nome do produto" />
                    <textarea className="prod-desc" rows={2} value={m.desc} onChange={(e) => upd(m.id, { desc: e.target.value })} placeholder="Descrição (ingredientes)" />
                  </div>
                  <div className="prod-side">
                    <label className="prod-price">
                      <span>R$</span>
                      <input type="number" step="0.01" min="0" value={m.preco} onChange={(e) => upd(m.id, { preco: parseFloat(e.target.value) || 0 })} />
                    </label>
                    <select value={m.cat} onChange={(e) => upd(m.id, { cat: e.target.value })}>
                      {CATEGORIAS.map((cc) => <option key={cc.id} value={cc.id}>{cc.nome}</option>)}
                    </select>
                    <label className="prod-star">
                      <input type="checkbox" checked={!!m.destaque} onChange={(e) => upd(m.id, { destaque: e.target.checked })} /> Destaque
                    </label>
                    <button className="prod-del" onClick={() => del(m.id)}>🗑 Remover</button>
                  </div>
                </div>
              ))}
            </section>
          )
        })}
        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}

/* --------------------------- util --------------------------- */
function formatPhone(w) {
  // 5518998166365 -> (18) 99816-6365
  const n = w.replace(/\D/g, '').replace(/^55/, '')
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return w
}
