export interface StartupIdentity {
  title: string
  icon?: string
  subtitle?: string
}
export interface BootstrapOptions extends StartupIdentity {
  root: HTMLElement
  /** startApplication resolves after the first usable view has been committed. */
  loadApplication(): Promise<{ startApplication(root: HTMLElement): void | Promise<void> }>
  onError?(reason: unknown): void
}
/** Infinite loading indicators never hold up the handoff; CSS owns all timing. */
function finishFiniteAnimations(element: HTMLElement): Promise<void> {
  const animations = element.getAnimations?.({ subtree: true }) ?? []
  return Promise.all(
    animations
      .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
      .map((animation) => animation.finished.catch(() => undefined))
  ).then(() => undefined)
}
/** Text and image identity are supplied by the host. Visual appearance lives in CSS. */
export async function bootstrapRenderer(options: BootstrapOptions): Promise<void> {
  const { root, title, icon, subtitle, loadApplication, onError } = options
  const screen = document.createElement('main')
  screen.dataset.ui = 'startup'
  screen.dataset.state = 'loading'
  screen.setAttribute('role', 'status')
  screen.setAttribute('aria-label', title + ' 正在启动')
  if (icon) {
    const mark = document.createElement('div')
    mark.dataset.part = 'mark'
    const image = document.createElement('img')
    image.src = icon
    image.alt = ''
    image.dataset.part = 'icon'
    mark.append(image)
    screen.append(mark)
  }
  const heading = document.createElement('h1')
  heading.dataset.part = 'title'
  heading.textContent = title
  screen.append(heading)
  if (subtitle) {
    const p = document.createElement('p')
    p.dataset.part = 'subtitle'
    p.textContent = subtitle
    screen.append(p)
  }
  const progress = document.createElement('div')
  progress.dataset.part = 'progress'
  progress.setAttribute('aria-hidden', 'true')
  screen.append(progress)
  const previousInert = root.inert
  const previousBusy = root.getAttribute('aria-busy')
  root.replaceChildren()
  root.inert = true
  root.setAttribute('aria-busy', 'true')
  // A sibling overlay survives React mounting into root. Detached roots are also supported.
  if (root.parentNode) root.after(screen)
  else root.append(screen)
  const entrance = finishFiniteAnimations(screen)
  try {
    const application = await loadApplication()
    await application.startApplication(root)
    // Loading and rendering proceed during the entrance; only the visual handoff waits.
    await entrance
    screen.dataset.state = 'leaving'
    await finishFiniteAnimations(screen)
    screen.remove()
  } catch (reason) {
    screen.dataset.state = 'error'
    screen.setAttribute('role', 'alert')
    screen.removeAttribute('aria-label')
    heading.textContent = '应用初始化失败'
    progress.remove()
    const message = document.createElement('p')
    message.textContent = reason instanceof Error ? reason.message : '请重新加载后重试'
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '重新加载'
    button.addEventListener('click', () => window.location.reload())
    screen.append(message, button)
    root.replaceChildren(screen)
    onError?.(reason)
  } finally {
    root.inert = previousInert
    if (previousBusy === null) root.removeAttribute('aria-busy')
    else root.setAttribute('aria-busy', previousBusy)
  }
}
