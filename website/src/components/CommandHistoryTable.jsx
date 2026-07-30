import { useState } from "react";
import { format } from "date-fns";
import { Search, Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function CommandHistoryTable({ commands }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = ["All", ...new Set(commands.map((c) => c.category || "General"))];

  const filtered = commands.filter((cmd) => {
    const matchesSearch = cmd.phrase.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || (cmd.category || "General") === category;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const headers = ["Timestamp,Phrase,Category,Emoji"];
    const rows = filtered.map(
      (c) =>
        `${new Date(c.timestamp).toISOString()},"${c.phrase}","${
          c.category || "General"
        }","${c.emoji || ""}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `echogaze_history_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] overflow-hidden flex flex-col shadow-lg">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
        <div className="flex w-full sm:w-auto gap-4">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search phrase..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-inner"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all cursor-pointer shadow-inner"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#05050A] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-sm font-semibold text-white rounded-xl transition-colors w-full sm:w-auto justify-center border border-white/5 hover:border-white/20 group"
        >
          <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/50 border-b border-white/10 font-bold">
            <tr>
              <th className="p-5 pl-6">Time</th>
              <th className="p-5">Phrase</th>
              <th className="p-5">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.length > 0 ? (
              paginated.map((cmd) => (
                <tr
                  key={cmd.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="p-5 pl-6 text-white/50 whitespace-nowrap font-medium">
                    {format(new Date(cmd.timestamp), "MMM d, h:mm a")}
                  </td>
                  <td className="p-5 font-bold text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform">
                      {cmd.emoji || "💬"}
                    </span>
                    {cmd.phrase}
                  </td>
                  <td className="p-5">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${
                      cmd.category === "Emergency" || cmd.status === "EMERGENCY"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {cmd.category || "General"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center text-white/40 font-medium">
                  No commands found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-5 border-t border-white/10 flex items-center justify-between bg-black/20 text-sm">
          <span className="text-white/40 font-medium text-xs tracking-wide">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:text-white/50 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:text-white/50 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
