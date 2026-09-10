import { getLeads as getCachedLeads, getSalesPeople as getCachedSalesPeople } from "@/lib/cachedQueries";

export async function getSalesPeople() {
  return getCachedSalesPeople();
}

export async function getLeads() {
  return getCachedLeads();
}