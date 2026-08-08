import api from "./api";

export function createOrganization({ name }) {
  return api.post("/admin/organization", { name }).then((res) => res.data);
}
