import { Link, useParams } from "react-router-dom";
import { INFO_PAGES } from "./infoContent.js";
import NotFound from "../NotFound.jsx";

export default function InfoPage() {
  const { slug } = useParams();

  // Object.hasOwn để slug kiểu "constructor" không bị coi là trang hợp lệ
  if (!Object.hasOwn(INFO_PAGES, slug)) return <NotFound />;
  const page = INFO_PAGES[slug];

  return (
    <div className="bg-white text-black px-8 py-9">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 text-xs text-gray-500">
          <Link to="/" className="hover:text-black">
            Home
          </Link>{" "}
          / <span className="text-black font-medium">{page.title}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold uppercase font-archivo-black">
          {page.title}
        </h1>
        {page.intro && (
          <p className="mt-3 text-base text-gray-600">{page.intro}</p>
        )}

        <div className="mt-8 flex flex-col gap-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold mb-3">{section.heading}</h2>

              {section.text?.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-gray-700 mb-2">
                  {p}
                </p>
              ))}

              {section.list && (
                <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-gray-700">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {section.table.head.map((h) => (
                          <th key={h} className="px-4 py-2 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row.join("-")} className="border-t border-gray-200">
                          {row.map((cell, i) => (
                            <td key={i} className="px-4 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
