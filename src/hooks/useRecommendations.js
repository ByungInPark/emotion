import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchRecommendedSchedules = async () => {
  const { data } = await axios.get("https://api.example.com/recommendations");
  return data;
};

export const useRecommendedSchedules = () => {
  return useQuery(["recommendedSchedules"], fetchRecommendedSchedules);
};