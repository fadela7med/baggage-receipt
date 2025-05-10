import React, { useEffect, useState } from 'react';

function Records() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/records')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error('Failed to fetch records:', err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Stored Records</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Passenger Name</th>
            <th>Bag Tag</th>
            <th>Destination</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, index) => (
            <tr key={index}>
              <td>{rec.name}</td>
              <td>{rec.bag_tag}</td>
              <td>{rec.destination}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Records;
