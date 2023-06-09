import { useUserStore } from "~/stores/user";
import { Tag, Group, Link, BlogType } from "../types/common";
import { storeToRefs } from "pinia";
import UserApi from "./userApi";

export default {
  async findAll(props: {
    tag?: Ref<string>;
    page: Ref<number>;
    sort?: Ref<string>;
  }) {
    const config = useRuntimeConfig();
    const { tag, page, sort } = props;
    return await useFetch<Group[]>(() => `group`, {
      baseURL: config.public.apiBase,
      params: { page, sort, tag },
    });
  },
  async count() {
    const config = useRuntimeConfig();
    return await useFetch<{
      groupCount: number;
      linkCount: number;
      postCount: number;
      linkCountByPlatform: { _count: number; type: BlogType }[];
    }>("group/counts", {
      baseURL: config.public.apiBase,
    });
  },
  async findAllTag() {
    const config = useRuntimeConfig();
    return await useFetch<Tag[]>("tag", {
      baseURL: config.public.apiBase,
    });
  },
  async findByDomain(domain: string) {
    const config = useRuntimeConfig();
    try {
      return await useFetch<Group>(() => `group/${domain}`, {
        baseURL: config.public.apiBase,
      });
    } catch (err) {
      throw new Error("");
    }
  },
  async create(props: {
    domain: string;
    title: string;
    description: string;
    tags: string[];
    links: Link[];
  }) {
    const userStore = useUserStore();
    const { user, atk } = storeToRefs(userStore);
    const config = useRuntimeConfig();
    const { domain, title, description, tags, links } = props;
    await $fetch("group", {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${atk.value}` },
      method: "post",
      body: {
        domain,
        title,
        description,
        tags,
        links,
      },
      onResponse: ({ request, options, response }) => {
        console.log(
          "GroupApi.create [fetch response ]",
          { request },
          { options },
          { status: response.status },
          { body: response.body }
        );
      },
      onResponseError: async ({ request, options, response }) => {
        const { data } = await UserApi.reissue();
        atk.value = data.value?.atk || "";
        console.log("GroupApi.create [fetch response  error]", { response });
      },
    });
  },
  async update(id: number, group: Group, tags: string[], links: Link[]) {
    const { domain, title, description } = group;
    try {
      await useFetch("group", {
        method: "put",
        body: {
          id,
          domain,
          title,
          description,
          links,
          tags,
        },
      });
    } catch (axiosError) {}
  },
  async updateLastPostCreateAt(groupId?: number) {
    if (!groupId) throw new Error("No Group Id");
    const config = useRuntimeConfig();
    await useFetch("group/last-post-create-at", {
      baseURL: config.public.apiBase,
      method: "put",
      body: {
        groupId,
      },
    });
  },
};
