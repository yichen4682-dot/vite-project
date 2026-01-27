function ProductModal ({
    modalType,
    templateProduct,
    handleModalImageChange,
    handleProductChange,
    removeImageField,
    closeModal,
    addImageField,
    updateProduct,
    deleteProduct,
    uploadImage
}) {
    return (
      
      <div className="modal fade" id="productModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className={`modal-header bg-${modalType === 'delete'? 'danger' : 'dark'} text-white`}>
              <h5 className="modal-title">
                {modalType === "delete" ? "刪除" : 
                modalType === 'edit' ? "編輯": "新增"}產品
              </h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              {
                modalType ==='delete'? (
                 <p className="fs-4">
	  確定要刪除
	  <span className="text-danger">{templateProduct.title}</span>嗎？
	</p> 
                ):(
<div className="row">
                <div className="col-sm-4 mb-3">
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">
                    上傳圖片
                  </label>
                  <input className="form-control"
                   type="file" 
                   name="fileUpload" 
                   id="fileUpload"  
                   accept=".jpg,.jpeg,.png"
                   onChange={(e) =>uploadImage(e)}
                   />
                  </div>
                  <label htmlFor="imageUrl" 
                  className="form-label"
                  >
                    主圖網址
                  </label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="imageUrl"
                    placeholder="請輸入圖片連結"
                    value={templateProduct.imageUrl}
                    onChange={handleProductChange}
                  />
                  {templateProduct.imageUrl && (
                    <img
                      src={templateProduct.imageUrl}
                      alt="主圖"
                      className="img-fluid mb-2"
                    />
                  )}

                  {templateProduct.imagesUrl.map((url, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        className="form-control mb-1"
                        value={url}
                        onChange={(e) => handleModalImageChange(index, e.target.value)}
                      />
                      {url && <img src={url} alt={`副圖${index + 1}`} className="img-fluid mb-1" />}
                      <button
                        className="btn btn-outline-danger btn-sm w-100 mb-1"
                        onClick={() => removeImageField(index)}
                        type="button"
                      >
                        刪除圖片
                      </button>
                    </div>
                  ))}

                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={addImageField}
                    type="button"
                  >
                    新增圖片
                  </button>
                </div>

                <div className="col-sm-8">
                  <div className="mb-3">
                    <label className="form-label">標題</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={templateProduct.title}
                      onChange={handleProductChange}
                      placeholder="請輸入標題"
                    />
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">分類</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={templateProduct.category}
                        onChange={handleProductChange}
                        placeholder="請輸入分類"
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">單位</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={templateProduct.unit}
                        onChange={handleProductChange}
                        placeholder="請輸入單位"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">原價</label>
                      <input
                        type="number"
                        className="form-control"
                        name="origin_price"
                        value={templateProduct.origin_price}
                        onChange={handleProductChange}
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">售價</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={templateProduct.price}
                        onChange={handleProductChange}
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">產品描述</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={templateProduct.description}
                      onChange={handleProductChange}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">說明內容</label>
                    <textarea
                      className="form-control"
                      name="content"
                      value={templateProduct.content}
                      onChange={handleProductChange}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_enabled"
                      checked={templateProduct.is_enabled}
                      onChange={handleProductChange}
                    />
                    <label className="form-check-label">是否啟用</label>
                  </div>
                </div>
              </div>

                )
              }
              
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline-secondary"
                onClick={closeModal}
                type="button"
              >
                取消
              </button>
            <button
  className={`btn btn-${modalType === "delete" ? "danger" : "primary"}`}
  type="button"
  onClick={() => {
    if (modalType === "delete") {
      deleteProduct(templateProduct.id);
    } else {
      updateProduct(templateProduct.id);
    }
  }}
>
  確認
</button>

            </div>
          </div>
        </div>
      </div>
    )
}

export default ProductModal