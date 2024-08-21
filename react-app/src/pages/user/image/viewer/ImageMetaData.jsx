import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'primereact/button';
import { fetchImageMetaData } from '../../../../services/userServices';

const ImageMetaData = ({ viewer }) => {
  const [metaData, setMetaData] = useState(null);

  useEffect(() => {
    if (viewer) {
      const loadMetaData = async () => {
        const id = viewer.getItemAt(0)?.getImage()?.id; // Assuming the image ID can be fetched like this
        if (id) {
          const data = await fetchImageMetaData(id);
          setMetaData(data);
        }
      };
      loadMetaData();
    }
  }, [viewer]);

  if (!metaData) return null;

  return (
    <MetaDataContainer>
      <MetaDataTable>
        <tbody>
          {Object.entries(metaData).map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </MetaDataTable>
      <Button
        icon='pi pi-times'
        onClick={() => setMetaData(null)}
        tooltip='Close'
      />
    </MetaDataContainer>
  );
};

const MetaDataContainer = styled.div`
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0);
  background: white;
  border: 1px solid #ccc;
  padding: 20px;
  z-index: 1000;
`;

const MetaDataTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 5px;
    border-bottom: 1px solid #ddd;
  }

  th {
    text-align: left;
    font-weight: bold;
  }
`;

export default ImageMetaData;
