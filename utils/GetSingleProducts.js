import { useGetSingleProductQuery } from "@/Features/api/AdminSlice";
import { useGetSingleEcomQuery } from "@/Features/api/EcomerceSlice";
import { useEffect } from "react";
const GetSingleProducts = ({ id, com }) => {
  const { data, error, isLoading } = useGetSingleEcomQuery(
    { id, },
    {
        pollingInterval: 10000, // Poll every 30 seconds    
      refetchOnMountOrArgChange: true, // Refetch when component mounts or args change
      refetchOnReconnect: true, // Refetch when the browser regains network connection
      refetchOnFocus: true, // Refetch when the window regains focus
    },
  );
//   useEffect(() => {
//     console.log(data);
//   }, [com, id,data]);

// const handleShare = async () => {
//     if (!data) return;
//     try {
//       await Share.share({
//         message: `Check out this ${data.name} on YsStore for just ₦${data.soldAtPrice.toLocaleString()}!`,
//         // url: `https://yourwebsite.com/product/${id}` // Add web link if you have one
//       });
//     } catch (error) {
//       Alert.alert("Error", "Could not share this product.");
//     }
//   };

  return { data, error, isLoading };
};

export default GetSingleProducts;
