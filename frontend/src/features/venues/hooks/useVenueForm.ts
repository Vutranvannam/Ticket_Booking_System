import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateVenueRequestSchema,
  type CreateVenueRequest,
} from "../schemas/venue.schemas";
import { venueService } from "../services/venue.service";
import type { Venue, UpdateVenueRequest } from "../types/venue.types";
import { useState, useEffect } from "react";

interface UseVenueFormProps {
  initialData?: Venue | null;
  onSuccess?: (venue: Venue) => void;
}

export function useVenueForm({ initialData, onSuccess }: UseVenueFormProps = {}) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateVenueRequest>({
    resolver: zodResolver(CreateVenueRequestSchema) as any,
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "Vietnam",
      zipCode: "",
      latitude: null,
      longitude: null,
      phone: "",
      email: "",
      description: "",
      visibility: "PRIVATE",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state ?? "",
        country: initialData.country,
        zipCode: initialData.zipCode ?? "",
        latitude: initialData.latitude ?? null,
        longitude: initialData.longitude ?? null,
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        description: initialData.description ?? "",
        visibility: initialData.visibility,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: CreateVenueRequest) => {
    setSubmitting(true);
    setError(null);
    try {
      let savedVenue: Venue;
      if (initialData?.id) {
        savedVenue = await venueService.updateVenue(initialData.id, data as UpdateVenueRequest);
      } else {
        savedVenue = await venueService.createVenue(data);
      }
      onSuccess?.(savedVenue);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Không thể lưu thông tin địa điểm");
    } finally {
      setSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting, error, setError };
}
