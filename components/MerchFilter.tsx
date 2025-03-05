import React from "react";
import { Listbox } from "@headlessui/react";
import { motion, Transition } from "framer-motion";
import { MerchFilterProps } from "@/types/MerchPage";

const MerchFilter: React.FC<MerchFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  title = "Category",
}) => {
  const transitionConfig: Transition = {
    duration: 0.2,
    type: "tween",
  };

  return (
    <div className="w-64">
      <Listbox value={selectedCategory} onChange={onCategoryChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full py-3 pl-4 pr-10 text-left bg-gray-800 rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 text-gray-100">
            {title}:{" "}
            <span className="font-bold text-blue-400">{selectedCategory}</span>
          </Listbox.Button>
          <Listbox.Options
            as={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 mt-2 w-full bg-gray-700 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
          >
            {categories.map((category) => (
              <Listbox.Option
                key={category}
                value={category}
                className={({ active }) =>
                  `${active ? "bg-white text-white" : "text-gray-200"}
                   cursor-default select-none relative py-2 pl-10 pr-4 hover:bg-blue-600/50 transition-colors`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`${
                        selected ? "font-bold" : "font-normal"
                      } block truncate`}
                    >
                      {category}
                    </span>
                    {selected ? (
                      <span
                        className={`${active ? "text-white" : "text-white"}
                         absolute inset-y-0 left-0 flex items-center pl-3`}
                      >
                        ✓
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default MerchFilter;
