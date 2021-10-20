import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { nanoid } from 'nanoid'

export class FileUploader {
  private repo: string
  request: AxiosInstance

  constructor(token: string, repo: string) {
    this.repo = repo
    this.request = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  }

  getFilePath(name: string, ext: string) {
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

  async getFileList(): Promise<
    {
      path: string
      mode: string
      type: string
      sha: string
      size: number
      url: string
    }[]
  > {
    const { data }: any = await this.request.get(
      `/repos/${this.repo}/git/trees/HEAD:uploads`,
      {
        params: {
          recursive: 1,
        },
      }
    )
    return data.tree
  }

  getFileUrl(payload: { path: string }) {
    const file = `${this.repo}/HEAD/uploads/${payload.path}`
    return {
      raw: `https://raw.githubusercontent.com/${file}`,
      jsdelivr: `https://cdn.jsdelivr.net/gh/${file}`,
      fastgit: `https://raw.fastgit.org/${file}`,
      zwc365: `https://pd.zwc365.com/https://raw.githubusercontent.com/${file}`,
      ghproxy: `https://ghproxy.com/https://raw.githubusercontent.com/${file}`,
    }
  }

  async upload(file: File): Promise<
    AxiosResponse<{
      name: string
      path: string
      sha: string
      size: number
      url: string
      html_url: string
      download_url: string
    }>
  > {
    const name = nanoid(8)
    const { base64, ext } = await this.getFileBase64(file)
    const path = this.getFilePath(name, ext)
    return this.request.put(`/repos/${this.repo}/contents/uploads/${path}`, {
      message: `upload file "${file.name}"`,
      content: base64,
    })
  }

  async delete(payload: { name: string; path: string; sha: string }): Promise<
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
