import { useEffect } from "react";

import { toast } from "react-toastify";
import moment from "moment";
import { fetchReceipts } from "../../features/customer/customer.slice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { exportToExcel } from "../../utils/utils";
import DashboardLayout from "../../layouts/DashboardLayout";

const CustomerReceiptsPage = () => {
  const dispatch = useAppDispatch();
  const { receipts, loading, error } = useAppSelector(
    (state) => state.customer
  );``

  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDownload = (receipt: any) => {
    // Mock PDF download (implement actual PDF generation in backend)
    toast.info(`Downloading receipt ${receipt.receiptNumber}`);
  };

  const handleExport = () => {
    exportToExcel(receipts, "my_receipts");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Receipts</h1>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Receipt Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receipts.map((receipt: any) => (
                  <tr key={receipt.id}>
                    <td className="px-6 py-4">{receipt.receiptNumber}</td>
                    <td className="px-6 py-4">${receipt.amount}</td>
                    <td className="px-6 py-4">
                      {moment(receipt.issueDate).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-6 py-4">{receipt.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(receipt)}
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerReceiptsPage;
