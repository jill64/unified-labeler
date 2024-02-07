import { octoflare } from 'octoflare'
import { PayloadData } from '../types/PayloadData.js'

export default octoflare<PayloadData>(
  async ({ env, payload, installation }) => {
    if (!installation) {
      return new Response('Skip Event: No Installation', {
        status: 200
      })
    }

    if ('label' in payload && payload.label) {
      const { label, repository, action } = payload

      if ('issue' in payload) {
        return new Response('Skip Event: No Trigger Event', {
          status: 200
        })
      }

      if (repository.owner.login !== env.OCTOFLARE_APP_OWNER) {
        return new Response('Skip Event: Not Octoflare App Owner', {
          status: 200
        })
      }

      if (repository.name !== env.OCTOFLARE_APP_REPO) {
        return new Response('Skip Event: Not Octoflare App Repo', {
          status: 200
        })
      }

      if (action === 'labeled' || action === 'unlabeled') {
        return new Response('Skip Event: No Trigger Label Action', {
          status: 200
        })
      }

      await installation.startWorkflow({
        repo: env.OCTOFLARE_APP_REPO,
        owner: env.OCTOFLARE_APP_OWNER,
        data:
          action === 'edited'
            ? {
                label,
                changes: payload.changes,
                type: action
              }
            : {
                label,
                type: action
              }
      })

      return new Response('Unified Labeler Workflow Dispatched', {
        status: 202
      })
    }

    return new Response('Skip Event: No Trigger Event', {
      status: 200
    })
  }
)
