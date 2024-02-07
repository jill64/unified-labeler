import { octoflare } from 'octoflare'
import { PayloadData } from '../types/PayloadData.js'

export default octoflare<PayloadData>(
  async ({ env, payload, installation }) => {
    if (!installation) {
      return new Response('Skip Event: No Installation', {
        status: 200
      })
    }

    // Label Changed
    if ('label' in payload && payload.label) {
      const { label, repository, action } = payload

      if (action === 'labeled' || action === 'unlabeled') {
        return new Response('Skip Event: No Trigger Label Action', {
          status: 200
        })
      }

      await installation.startWorkflow({
        repo: env.OCTOFLARE_APP_REPO,
        owner: env.OCTOFLARE_APP_OWNER,
        data: {
          label,
          repo: repository.name,
          owner: repository.owner.login,
          type: payload.action
        }
      })

      return new Response('Unified Labeler Workflow Dispatched', {
        status: 202
      })
    }

    // Repo Created
    if (
      'repository' in payload &&
      payload.repository &&
      'action' in payload &&
      payload.action === 'created' &&
      'sender' in payload &&
      payload.sender
    ) {
      const { repository } = payload

      await installation.startWorkflow({
        repo: 'unified-labeler',
        owner: 'jill64',
        data: {
          repo: repository.name,
          owner: repository.owner.login,
          type: 'repo_created'
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
