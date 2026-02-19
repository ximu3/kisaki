/**
 * Service Container
 *
 * Manages service registration, initialization, and disposal.
 *
 * Lifecycle is explicitly two-phase:
 * 1) register(): add service instances (no side effects)
 * 2) initAll(): initialize services in dependency order
 *
 * On shutdown, services are disposed in reverse init order.
 */

import type { IService, ServiceStatus, ServiceName, ServiceType } from './types'
import log from 'electron-log/main'

export class ServiceContainer {
  private services = new Map<string, IService>()
  private serviceStatus = new Map<string, ServiceStatus>()
  private initOrder: string[] = []

  /**
   * Register a service instance (no initialization).
   */
  async register<T extends IService>(service: T): Promise<this> {
    if (this.services.has(service.id)) {
      throw new Error(`Service "${service.id}" is already registered`)
    }

    this.services.set(service.id, service)
    this.serviceStatus.set(service.id, 'registered')
    log.info(`[Container] Registered: ${service.id}`)

    return this
  }

  /**
   * Initialize all registered services in dependency order.
   */
  async initAll(): Promise<void> {
    if (this.services.size === 0) {
      throw new Error('[Container] No services registered')
    }

    const initOrder = this.computeInitOrder()
    log.info(`[Container] Initializing ${initOrder.length} services...`)

    // Reset init order for this run (idempotent initAll is not supported).
    this.initOrder = []

    try {
      for (const id of initOrder) {
        const service = this.services.get(id)
        if (!service) {
          throw new Error(`[Container] Internal error: missing registered service "${id}"`)
        }

        this.serviceStatus.set(id, 'initializing')
        try {
          await service.init(this)
          this.serviceStatus.set(id, 'ready')
          this.initOrder.push(id)
          log.info(`[Container] Ready: ${id}`)
        } catch (error) {
          this.serviceStatus.set(id, 'failed')
          log.error(`[Container] Failed to initialize ${id}:`, error)
          throw error
        }
      }

      log.info('[Container] All services initialized')
    } catch (error) {
      await this.rollbackInit()
      throw error
    }
  }

  /**
   * Get a service by name with automatic type inference.
   * @throws Error if service not registered or not ready
   */
  get<K extends ServiceName>(name: K): ServiceType<K>
  get<T extends IService>(name: string): T
  get(name: string): IService {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service "${name}" not found`)
    }

    const status = this.serviceStatus.get(name)
    if (status !== 'ready') {
      throw new Error(`Service "${name}" is not ready (status: ${status ?? 'unknown'})`)
    }
    return service
  }

  /**
   * Try to get a service by name.
   * Returns undefined if service not registered or not ready.
   */
  tryGet<K extends ServiceName>(name: K): ServiceType<K> | undefined
  tryGet<T extends IService>(name: string): T | undefined
  tryGet(name: string): IService | undefined {
    const service = this.services.get(name)
    if (!service) return undefined
    return this.serviceStatus.get(name) === 'ready' ? service : undefined
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name)
  }

  /**
   * Get the dependency graph for all registered services.
   */
  getGraph(): Record<string, readonly string[]> {
    const graph: Record<string, readonly string[]> = {}
    for (const [id, service] of this.services) {
      graph[id] = service.deps
    }
    return graph
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys())
  }

  /**
   * Get the status of a service or all services
   */
  getStatus<K extends ServiceName>(name: K): ServiceStatus | undefined
  getStatus(name: string): ServiceStatus | undefined
  getStatus(): Record<string, ServiceStatus>
  getStatus(name?: string): ServiceStatus | undefined | Record<string, ServiceStatus> {
    if (name === undefined) {
      const allStatus: Record<string, ServiceStatus> = {}
      for (const [n, status] of this.serviceStatus) {
        allStatus[n] = status
      }
      return allStatus
    }
    return this.serviceStatus.get(name)
  }

  /**
   * Check if all services are ready
   */
  isReady(): boolean {
    if (this.services.size === 0) return false
    for (const [id, status] of this.serviceStatus) {
      if (this.services.has(id) && status !== 'ready') return false
    }
    return true
  }

  /**
   * Unregister and dispose a service at runtime.
   */
  async unregister(name: string): Promise<void> {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service "${name}" not found`)
    }

    const status = this.serviceStatus.get(name)
    if (status === 'initializing') {
      throw new Error(`Service "${name}" is initializing and cannot be unregistered`)
    }

    log.info(`[Container] Unregistering: ${name}`)

    if (status === 'ready' && service.dispose) {
      this.serviceStatus.set(name, 'disposing')
      try {
        await service.dispose()
      } catch (error) {
        log.error(`[Container] Error disposing ${name}:`, error)
      }
    }

    this.services.delete(name)
    this.serviceStatus.delete(name)
    this.initOrder = this.initOrder.filter((n) => n !== name)
  }

  /**
   * Dispose all initialized services in reverse init order.
   * Called during application shutdown.
   */
  async disposeAll(): Promise<void> {
    log.info('[Container] Disposing all services...')

    const reverseOrder = [...this.initOrder].reverse()
    for (const name of reverseOrder) {
      const service = this.services.get(name)
      if (service?.dispose && this.serviceStatus.get(name) === 'ready') {
        log.info(`[Container] Disposing: ${name}`)
        this.serviceStatus.set(name, 'disposing')
        try {
          await service.dispose()
          this.serviceStatus.set(name, 'disposed')
        } catch (error) {
          log.error(`[Container] Error disposing ${name}:`, error)
        }
      }
    }

    this.services.clear()
    this.serviceStatus.clear()
    this.initOrder = []
    log.info('[Container] All services disposed')
  }

  private computeInitOrder(): string[] {
    const graph = new Map<string, readonly string[]>()

    for (const [id, service] of this.services) {
      graph.set(id, service.deps ?? [])
    }

    // Validate missing dependencies early
    for (const [id, deps] of graph) {
      for (const dep of deps) {
        if (!graph.has(dep)) {
          throw new Error(
            `[Container] Service "${id}" depends on missing service "${dep}". Registered: ${[
              ...graph.keys()
            ].join(', ')}`
          )
        }
      }
    }

    // Kahn's algorithm for topological sort
    const inDegree = new Map<string, number>()
    const dependents = new Map<string, string[]>()
    for (const id of graph.keys()) {
      inDegree.set(id, 0)
      dependents.set(id, [])
    }
    for (const [id, deps] of graph) {
      for (const dep of deps) {
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
        dependents.get(dep)!.push(id)
      }
    }

    const queue: string[] = []
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id)
    }

    const order: string[] = []
    while (queue.length > 0) {
      const id = queue.shift()!
      order.push(id)

      for (const next of dependents.get(id) ?? []) {
        const deg = (inDegree.get(next) ?? 0) - 1
        inDegree.set(next, deg)
        if (deg === 0) queue.push(next)
      }
    }

    if (order.length !== graph.size) {
      const remaining = [...graph.keys()].filter((id) => !order.includes(id))
      const cycle = this.findCycle(graph, remaining[0])
      const cycleText = cycle ? cycle.join(' -> ') : remaining.join(', ')
      throw new Error(`[Container] Circular dependency detected: ${cycleText}`)
    }

    return order
  }

  private findCycle(graph: Map<string, readonly string[]>, start?: string): string[] | null {
    if (!start) return null

    const visiting = new Set<string>()
    const visited = new Set<string>()
    const stack: string[] = []

    const dfs = (id: string): string[] | null => {
      visiting.add(id)
      stack.push(id)

      for (const dep of graph.get(id) ?? []) {
        if (!visited.has(dep)) {
          if (visiting.has(dep)) {
            const idx = stack.indexOf(dep)
            const cycle = stack.slice(idx)
            return [...cycle, dep]
          }
          const found = dfs(dep)
          if (found) return found
        }
      }

      visiting.delete(id)
      visited.add(id)
      stack.pop()
      return null
    }

    return dfs(start)
  }

  private async rollbackInit(): Promise<void> {
    if (this.initOrder.length === 0) return

    log.warn('[Container] Rolling back initialized services...')

    const reverse = [...this.initOrder].reverse()
    for (const id of reverse) {
      const service = this.services.get(id)
      if (!service?.dispose) continue

      log.info(`[Container] Disposing (rollback): ${id}`)
      this.serviceStatus.set(id, 'disposing')
      try {
        await service.dispose()
        this.serviceStatus.set(id, 'disposed')
      } catch (error) {
        log.error(`[Container] Error disposing ${id} during rollback:`, error)
      }
    }

    this.initOrder = []
    log.warn('[Container] Rollback complete')
  }
}

/**
 * Global service container instance
 */
export const container = new ServiceContainer()
