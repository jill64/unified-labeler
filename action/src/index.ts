import { action } from 'octoflare/action'
import { PayloadData } from '../../types/PayloadData.js'

action<PayloadData>(async ({ payload, octokit }) => {
  const { owner, repo, data } = payload

  const allRepo = await octokit.paginate('GET /users/{username}/repos', {
    username: owner,
    per_page: 100
  })

  class Labeler {
    private repo
    private owner
    private old_name =
      ('changes' in data ? data.changes?.name?.from : null) ?? data.label.name

    constructor(repo: string, owner: string) {
      this.repo = repo
      this.owner = owner
    }

    get() {
      return octokit.rest.issues.getLabel({
        owner: this.owner,
        repo: this.repo,
        name: this.old_name
      })
    }

    create() {
      return octokit.rest.issues.createLabel({
        owner: this.owner,
        repo: this.repo,
        name: data.label.name,
        color: data.label.color,
        description: data.label.description ?? ''
      })
    }

    update() {
      return octokit.rest.issues.updateLabel({
        owner: this.owner,
        repo: this.repo,
        name: this.old_name,
        new_name: data.label.name,
        color: data.label.color,
        description: data.label.description ?? ''
      })
    }

    delete() {
      return octokit.rest.issues.deleteLabel({
        owner: this.owner,
        repo: this.repo,
        name: data.label.name
      })
    }
  }

  const result = allRepo
    .filter((x) => x.name !== repo)
    .map(async (repo) => {
      const labeler = new Labeler(repo.name, repo.owner.login)

      if (data.type === 'deleted') {
        return await labeler.delete()
      }

      if (data.type === 'created' || data.type === 'edited') {
        try {
          await labeler.get()
          await labeler.update()
        } catch {
          await labeler.create()
        }
      }
    })

  await Promise.allSettled(result)
})
