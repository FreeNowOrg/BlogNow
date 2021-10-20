import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { nanoid } from 'nanoid'

export class FileUploader {
  private repo!: string
  private token!: string
  request!: AxiosInstance

  /**
   * @param token e.g. `ghp_ABCabc123`
   * @param repo e.g. `username/reponame`
   */
  constructor(token: string, repo: string) {
    this.setToken(token)
    this.setRepo(repo)
  }

  private getRequest() {
    return axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  setToken(token: string) {
    this.token = token
    this.request = this.getRequest()
    return this
  }

  setRepo(repo: string) {
    this.repo = repo
    return this
  }

  private generateFilePath(name: string, ext: string) {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = `0${now.getMonth() + 1}`.slice(-2)
    const dd = `0${now.getDate()}`.slice(-2)
    return `${yyyy}/${mm}/${dd}/${name}.${ext}`
  }

  async getFileBase64(
    file: File
  ): Promise<{ base64: string; url: string; ext: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener(
        'load',
        function () {
          const url = reader.result as string
          const base64 = url?.split(',')[1]
          const ext = file.type.split('/')[1]
          return resolve({ url, base64, ext })
        },
        false
      )
    })
  }

  async getFileList(): Promise<FilePayload[]> {
    const { data }: any = await this.request.get(
      `/repos/${this.repo}/git/trees/HEAD:uploads`,
      {
        params: {
          recursive: 1,
          _random: Math.random(),
        },
      }
    )
    const list = (data.tree as FilePayload[])
      .filter(({ type }) => type === 'blob')
      .map((i) => {
        i.html_url = `https://github.com/${this.repo}/tree/HEAD/uploads/${i.path}`
        i.name = i.path.split('/').pop() as string
        return i
      })
    console.log(list)
    return list
  }

  /**
   * @desc Get file raw url and proxy urls
   */
  getFileUrl(payload: FilePayload) {
    const file = `${this.repo}/HEAD/uploads/${payload.path}`
    return {
      raw: `https://raw.githubusercontent.com/${file}`,
      fastgit: `https://raw.fastgit.org/${file}`,
      ghproxy: `https://ghproxy.com/https://raw.githubusercontent.com/${file}`,
      jsdelivr: `https://cdn.jsdelivr.net/gh/${this.repo}/uploads/${payload.path}`,
      zwc365: `https://pd.zwc365.com/https://raw.githubusercontent.com/${file}`,
    }
  }

  async upload(file: File): Promise<AxiosResponse<{ content: FilePayload }>> {
    const name = nanoid(8)
    const { base64, ext } = await this.getFileBase64(file)
    const path = this.generateFilePath(name, ext)
    return this.request.put(`/repos/${this.repo}/contents/uploads/${path}`, {
      message: `upload file "${file.name}"`,
      content: base64,
    })
  }

  async delete(payload: FilePayload): Promise<
    AxiosResponse<{
      commit: {
        sha: string
        node_id: string
        url: string
        html_url: string
        committer: {
          name: string
          date: string
        }
      }
    }>
  > {
    return this.request.delete(
      `/repos/${this.repo}/contents/uploads/${payload.path}`,
      {
        data: {
          message: `remove file "${payload.name}"`,
          sha: payload.sha,
        },
      }
    )
  }
}

export interface FilePayload {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'tree' | 'blob'
}
