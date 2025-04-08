  return (
    <>
      <style>{customStyles}</style>
      <form onSubmit={handleSubmit} className="space-y-3 relative z-0 max-w-[500px] mx-auto scale-[0.85] origin-top">
        <div className="bg-white rounded-xl overflow-hidden relative z-10">
          <div className="p-3">
            <div className="mb-4 relative z-20">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative bg-purple-50 p-2 rounded-xl shadow-sm">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 text-sm"
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="relative bg-purple-50 p-2 rounded-xl shadow-sm">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date) => setEndDate(date)}
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900 text-sm"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date(startDate.getTime() + 86400000)}
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 relative z-10">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Configure Appliances
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {appliances.map((appliance) => (
                  <div
                    key={appliance.id}
                    className="bg-white rounded-xl p-2 border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="bg-purple-800 p-1.5 rounded-lg shadow-md">
                          <div className="text-white">
                            {appliance.icon}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-900">
                            {appliance.name}
                          </label>
                          <span className="text-[10px] text-gray-600">{appliance.powerUsage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-purple-50 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => handleApplianceChange(appliance.id, Math.max(0, applianceCounts[appliance.id] - 1))}
                        className="p-1 rounded-lg bg-white text-purple-600 hover:bg-purple-100 transition-colors shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={applianceCounts[appliance.id]}
                        onChange={(e) => handleApplianceChange(appliance.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="mx-1 w-10 text-center p-1 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium text-xs"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplianceChange(appliance.id, applianceCounts[appliance.id] + 1)}
                        className="p-1 rounded-lg bg-white text-purple-600 hover:bg-purple-100 transition-colors shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-xl 
                  hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 
                  focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                  flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Generate Prediction
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  ); 