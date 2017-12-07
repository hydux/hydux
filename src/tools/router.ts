import { ActionType, ActionsType } from './../types'
import { AppProps, App } from './../index'
import Cmd, { CmdType } from './../cmd'
import { get } from '../utils'

type MyAppProps<State, Actions> = AppProps<State, Actions> & {
  init: (page: any) => State | [State, CmdType<State, Actions>],
}

type Router<P, Q> = {
  pathname: string,
  params: P,
  query: Q,
  search: string,
}

export default function withRouter<State, Actions, RouterActions>({
  type = 'hash',
  routes = {
    // '/home': router => actions => actions.home()
  },
}: {
  type?: 'hash' | 'history',
  routes?: {[key: string]: (actions: RouterActions) => ActionType<Router<any, any>, State, Actions>},
} = {}): (app: App<State, Actions>) => App<State, Actions> {
  let timer
  return (app: App<State, Actions>) => (props: MyAppProps<State, Actions>) => {
    return app({
      ...props,
      init: () => {
        return props.init('aaa')
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub(actions => {
          window.addEventListener('hashchange', e => {
            const url = location.hash.replace('#', '')
          })
        }),
        props.subscribe(state)
      ),
      actions: {
        ...(props.actions as any),
        routes: {

        },
        location: {
          assign(path) {
            location.hash = '#' + path
          },
          replace(path) {
            location.replace('#' + path)
          },
        }
      }
    })
  }

}
