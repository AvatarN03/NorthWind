import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/api";


export function useHomeCatalog() {
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryFilter = searchParams.get("category")?.trim() ?? "";

    const setCategory = (category) => {
        const next = new URLSearchParams(searchParams);

        if (!category) {
            next.delete("category");
        } else {
            next.set("category", category);
        }

        setSearchParams(next, { replace: true });
    }

    const {data:categoriesData, isLoading:categoriesLoading} = useQuery({
        queryKey: ["products"],
        queryFn: async () => await apiFetch("/api/products/categories")

    });

    const {data:productsData, isLoading:productsLoading, error: productsError} = useQuery({
        queryKey: ["products", categoryFilter],
        queryFn: async () => await apiFetch(categoryFilter ? `/api/products?category=${encodeURIComponent(categoryFilter)}` : "/api/products"),
        enabled: !!categoriesData
    });

    const categories = categoriesData?.categories ?? [];
    const products = productsData?.products ?? [];
    const categoryChipsLoading = categoriesLoading && categories.length === 0;

    return { categoryFilter, setCategory, categories, products, categoryChipsLoading, productsError, productsLoading, categoriesLoading };
}