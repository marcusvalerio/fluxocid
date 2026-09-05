import { LocalLayoutRepository } from './LocalLayoutRepository'
import { RemoteLayoutRepository } from './RemoteLayoutRepository'
import type { LayoutRepository } from './LayoutRepository'

const localRepository: LayoutRepository = new LocalLayoutRepository()
let active: LayoutRepository = localRepository

export function getLocalLayoutRepository(): LayoutRepository { return localRepository }
export function activateRemoteRepository(userId: string): void { active = new RemoteLayoutRepository(userId) }
export function activateLocalRepository(): void { active = localRepository }

export const layoutRepository: LayoutRepository = {
  listLayouts: (...args) => active.listLayouts(...args),
  getLayout: (...args) => active.getLayout(...args),
  createLayout: (...args) => active.createLayout(...args),
  renameLayout: (...args) => active.renameLayout(...args),
  deleteLayout: (...args) => active.deleteLayout(...args),
  saveLayoutObjects: (...args) => active.saveLayoutObjects(...args),
  updateLayoutSettings: (...args) => active.updateLayoutSettings(...args),
  saveFlowBoard: (...args) => active.saveFlowBoard(...args),
}
