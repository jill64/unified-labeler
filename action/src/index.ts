import { action } from 'octoflare/action'
import { PayloadData } from '../../types/PayloadData.js'

action<PayloadData>(async ({ payload, octokit }) => {
  const { owner, repo, data } = payload
  const { data: allRepo } = await octokit.rest.repos.listForUser({
    username: owner
  })

  class Labeler {
    private repo
    private owner
    private label

    constructor(
      repo: string,
      owner: string,
      label: {
        name: string
        color: string
        description: string | null
      }
    ) {
      this.repo = repo
      this.owner = owner
      this.label = label
    }

    create() {
      return octokit.rest.issues.createLabel({
        owner: this.owner,
        repo: this.repo,
        name: this.label.name,
        color: this.label.color,
        description: this.label.description ?? ''
      })
    }

    update() {
      return octokit.rest.issues.createLabel({
        owner: this.owner,
        repo: this.repo,
        name: this.label.name,
        color: this.label.color,
        description: this.label.description ?? ''
      })
    }

    delete() {
      return octokit.rest.issues.deleteLabel({
        owner: this.owner,
        repo: this.repo,
        name: this.label.name
      })
    }
  }

  if (data.type === 'repo_created') {
    const [{ data: base }, { data: labels }] = await Promise.all([
      await octokit.rest.issues.listLabelsForRepo({
        owner,
        repo
      }),
      await octokit.rest.issues.listLabelsForRepo({
        owner: data.owner,
        repo: data.repo
      })
    ])

    await Promise.all(
      base.map(async (label) => {
        const labeler = new Labeler(data.repo, data.owner, label)
        await (labels.includes(label) ? labeler.update() : labeler.create())
      })
    )

    const { data: newLabels } = await octokit.rest.issues.listLabelsForRepo({
      owner: data.owner,
      repo: data.repo
    })

    await Promise.all(
      newLabels.map(async (label) => {
        if (!base.includes(label)) {
          const labeler = new Labeler(data.repo, data.owner, label)
          await labeler.delete()
        }
      })
    )

    return
  }

  const result = allRepo
    .filter((x) => x.name !== data.repo)
    .map(async (repo) => {
      const { data: labels } = await octokit.rest.issues.listLabelsForRepo({
        owner: repo.owner.login,
        repo: repo.name
      })

      const label = new Labeler(repo.name, repo.owner.login, data.label)

      if (data.type === 'deleted') {
        return await label.delete()
      }

      if (data.type === 'created') {
        return await label.create()
      }

      if (data.type === 'edited') {
        await (labels.includes(data.label) ? label.update() : label.create())
      }
    })

  await Promise.allSettled(result)
})
