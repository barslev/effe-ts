import { Observable } from 'rxjs'
import * as Rr from 'fp-ts/lib/Reader'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Monad3 } from 'fp-ts/lib/Monad'
import { Profunctor3 } from 'fp-ts/lib/Profunctor'
import * as sub from './Sub'
import { Cmd } from './Cmd'
import { CmdR } from './CmdR'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind3<R, E, A> {
    'effe-ts/SubR': SubR<R, E, A>
  }
}

export const URI = 'effe-ts/SubR'
export type URI = typeof URI

export interface SubR<R, Model, Action> extends Rr.Reader<R, sub.Sub<Model, Action>> {}

export const none: SubR<{}, unknown, never> = Rr.of(sub.none)

export function fromObservable<R, Model, Action>(actions$: Observable<Action>): SubR<R, Model, Action> {
  return Rr.of(sub.fromObservable(actions$))
}

export function fromSub<R, Model, Action>(sub: sub.Sub<Model, Action>): SubR<R, Model, Action> {
  return Rr.of(sub)
}

export function fromCmd<R, Model, Action>(cmd: Cmd<Action>): SubR<R, Model, Action> {
  return fromSub(sub.fromCmd(cmd))
}

export function fromCmdR<R, Model, Action>(cmdr: CmdR<R, Action>): SubR<R, Model, Action> {
  return r => sub.fromCmd(cmdr(r))
}

export function getMonoid<R, Model, Action>(): Monoid<SubR<R, Model, Action>> {
  return Rr.getMonoid(sub.getMonoid())
}

export const subr: Profunctor3<URI> & Monad3<URI> = {
  URI,
  map: (ma, f) => r => sub.sub.map(ma(r), f),
  promap: (fbc, f, g) => r => sub.sub.promap(fbc(r), f, g),
  ap: (mab, ma) => r => sub.sub.ap(mab(r), ma(r)),
  of: a => Rr.of(sub.sub.of(a)),
  chain: (ma, f) => r => sub.sub.chain(ma(r), a => f(a)(r))
}

const { ap, apFirst, apSecond, chain, map, chainFirst, flatten, promap } = pipeable(subr)

export { ap, apFirst, apSecond, chain, chainFirst, flatten, map, promap }
