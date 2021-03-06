<?php
/**
 * @author Amasty Team
 * @copyright Copyright (c) 2020 Amasty (https://www.amasty.com)
 * @package Amasty_Mostviewed
 */


namespace Amasty\Mostviewed\Controller\Cart;

use Amasty\Mostviewed\Block\Product\Popup;
use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Catalog\Helper\Product;
use Magento\Checkout\Model\Cart as CustomerCart;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Url\Helper\Data as UrlHelper;
use Magento\Framework\View\LayoutInterface;
use Magento\Framework\View\Result\PageFactory;

class Add extends \Magento\Checkout\Controller\Cart\Add
{
    /**
     * @var Product
     */
    private $productHelper;

    /**
     * @var PageFactory
     */
    private $resultPageFactory;

    /**
     * @var UrlHelper
     */
    private $urlHelper;

    /**
     * @var \Magento\Framework\Registry
     */
    private $coreRegistry;

    /**
     * @var \Magento\Framework\View\LayoutFactory
     */
    private $layoutFactory;

    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Framework\Data\Form\FormKey\Validator $formKeyValidator,
        CustomerCart $cart,
        ProductRepositoryInterface $productRepository,
        Product $productHelper,
        PageFactory $resultPageFactory,
        UrlHelper $urlHelper,
        \Magento\Framework\Registry $coreRegistry,
        \Magento\Framework\View\LayoutFactory $layoutFactory
    ) {
        parent::__construct(
            $context,
            $scopeConfig,
            $checkoutSession,
            $storeManager,
            $formKeyValidator,
            $cart,
            $productRepository
        );
        $this->productHelper = $productHelper;
        $this->resultPageFactory = $resultPageFactory;
        $this->urlHelper = $urlHelper;
        $this->coreRegistry = $coreRegistry;
        $this->layoutFactory = $layoutFactory;
    }

    /**
     * @return \Magento\Framework\Controller\Result\Json|\Magento\Framework\Controller\Result\Redirect
     */
    public function execute()
    {
        if (!$this->_formKeyValidator->validate($this->getRequest())) {
            $message = __('We can\'t add these items to your shopping cart right now. Please reload the page.');
            return $this->generateAjaxResponse($message, false);
        }

        $popupProducts = $this->getRequest()->getParam('amrelated_products_popup', false);

        if ($popupProducts) {
            $messages = [];
            $countProducts = count($popupProducts);

            foreach ($popupProducts as $key => $popupProductParams) {
                // @codingStandardsIgnoreLine
                parse_str($popupProductParams, $params);
                $isLast = ($key == $countProducts - 1) ? true : false;
                list($message, $status) = $this->addProductWithParams($params, $isLast);

                if (!$status) {
                    return $this->generateAjaxResponse($message, $status);
                }

                $messages[] = $message;
            }
            $message = implode(' ', $messages);
        } else {
            $params = $this->getRequest()->getParams();
            list($message, $status) = $this->addProductWithParams($params, true);

            if ($message instanceof \Magento\Framework\Controller\Result\Json) {
                return $message;
            }
        }

        return $this->generateAjaxResponse($message, $status);
    }

    /**
     * @param $params
     * @param bool $isLast
     *
     * @return array|\Magento\Framework\Controller\Result\Json
     */
    protected function addProductWithParams($params, $isLast)
    {
        try {
            if (isset($params['qty'])) {
                $filter = new \Zend_Filter_LocalizedToNormalized(
                    ['locale' => $this->_objectManager->get(
                        \Magento\Framework\Locale\ResolverInterface::class
                    )->getLocale()]
                );
                $params['qty'] = $filter->filter($params['qty']);
            }

            $product = $this->initializeProduct(isset($params['product']) ? $params['product'] : null);
            $related = $this->getRequest()->getParam('amrelated_products');

            if ($product) {
                $this->cart->addProduct($product, $params);
            }

            $bundleResult = [];

            if (!empty($related)) {
                $bundleResult = $this->addProductsByIds($related);
            }

            if ($isLast) {
                $this->cart->save();
            }

            //should show popup for composite products
            if ($bundleResult) {
                return [$this->generatePopupResponse($bundleResult), false];
            } else {
                $this->messageManager->addComplexSuccessMessage(
                    'addPackSuccessMessage',
                    ['cart_url' => $this->getCartUrl()]
                );

                return ['', true];
            }
        } catch (\Magento\Framework\Exception\LocalizedException $e) {
            return [$e->getMessage(), false];
        } catch (\Exception $e) {
            $message = __('We can\'t add this item to your shopping cart right now.');

            return [$message, false];
        }
    }

    /**
     * @param array $productIds
     *
     * @return array
     */
    protected function addProductsByIds(array $productIds)
    {
        $skippedProducts = [];

        foreach ($productIds as $productId => $qty) {
            $productId = (int)$productId;

            if (!$productId) {
                continue;
            }

            $product = $this->getProductById($productId);

            if (is_object($product) && $product->getId() && $product->isVisibleInCatalog()) {
                try {
                    $result = $this->cart->getQuote()->addProduct($product, $qty);

                    if (is_string($result)) {
                        throw new LocalizedException(__($result));
                    }
                } catch (\Exception $e) {
                    $skippedProducts[$productId] = [
                        'message' => $e->getMessage(),
                        'product' => $product
                    ];
                }
            } else {
                $skippedProducts[$productId] = [
                    'message' => __('We can\'t add this item to your shopping cart right now.'),
                    'product' => $product
                ];
            }
        }

        return $skippedProducts;
    }

    /**
     * @param $productId
     *
     * @return bool|ProductInterface
     * @throws NoSuchEntityException
     */
    private function getProductById($productId)
    {
        $storeId = $this->_storeManager->getStore()->getId();
        try {
            return $this->productRepository->getById($productId, false, $storeId);
        } catch (NoSuchEntityException $e) {
            return $productId;
        }
    }

    /**
     * @param array $bundleResult
     *
     * @return \Magento\Framework\Controller\Result\Json
     */
    protected function generatePopupResponse($bundleResult)
    {
        $result = ['is_add_to_cart' => 0];
        $products = [];
        $this->_view->loadLayout();

        foreach ($bundleResult as $productId => $item) {
            $products[$productId] = [
                'html' => $this->generateOptionsForProduct($item['product']),
                'message' => $item['message'],
            ];
        }

        $block = $this->layoutFactory->create()->createBlock(Popup::class, 'amasty.mostviewed.popup', []);

        if ($block) {
            $block->setProducts($products);
            $result['html'] = $block->toHtml();
        }

        $result = $this->prepareResult($result);
        /** @var \Magento\Framework\Controller\Result\Json $resultJson */
        $resultJson = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        $resultJson->setData($result);

        return $resultJson;
    }

    /**
     * @param ProductInterface|int $product
     *
     * @return string
     * @throws NoSuchEntityException
     */
    protected function generateOptionsForProduct($product)
    {
        $html = '';

        if (!is_object($product)) {
            $product = $this->getProductById($product);
        }

        if (!is_object($product)) {
            return '';
        }

        $product->setCustomOptions([]); // fix error for bundle products
        /** @var ProductInterface $product */
        $this->coreRegistry->unregister('current_product');
        $this->coreRegistry->unregister('product');
        $this->coreRegistry->unregister('current_category');
        $this->productHelper->initProduct($product->getId(), $this);
        $page = $this->resultPageFactory->create(false, ['isIsolated' => true]);
        $page->addHandle('catalog_product_view');
        $page->addHandle('catalog_product_view_type_' . $product->getTypeId());
        $layout = $page->getLayout();

        // remove request a quote button
        $layout->unsetElement('product.info.addquote')
            ->unsetElement('product.info.addquote.additional');

        $block = $layout->createBlock(
            \Amasty\Mostviewed\Block\Product\MiniPage::class,
            'amasty.mostviewed.minipage',
            [
                'data' =>
                    [
                        'product'       => $product,
                        'loaded_layout' => $layout,
                        'optionsHtml'   => $this->generateOptionsHtml($product, $layout)
                    ]
            ]
        );

        if ($block) {
            $html = $block->toHtml();
        }

        return $html;
    }

    /**
     * Generate html for product options
     * @param ProductInterface $product
     * @param LayoutInterface $layout
     *
     * @return mixed|string
     */
    protected function generateOptionsHtml(ProductInterface $product, LayoutInterface $layout)
    {
        $block = $layout->getBlock('product.info');

        if (!$block) {
            $block = $layout->createBlock(
                \Magento\Catalog\Block\Product\View::class,
                'product.info',
                [ 'data' => [] ]
            );
        }

        $qty = $this->getRequest()->getParam('amrelated_products')[$product->getId()] ?? 1;
        if ($qty > 1) {
            $values = $product->getPreconfiguredValues();
            $values->setQty($qty);
            $product->setPreconfiguredValues($values);
        }

        $block->setProduct($product);
        $html = $block->toHtml();

        $html = str_replace(
            '"spConfig',
            '"priceHolderSelector": ".price-box[data-product-id=' . $product->getId() . ']", "spConfig',
            $html
        );
        $html = $this->replaceHtmlElements($html, $product);

        return $html;
    }

    /**
     * @param $message
     * @param $status
     *
     * @return \Magento\Framework\Controller\Result\Json
     */
    protected function generateAjaxResponse($message, $status)
    {
        $result = ['is_add_to_cart' => $status];

        if (!$status) {
            $this->messageManager->addErrorMessage($message);
            $result['error'] = true;
        }

        $result = $this->prepareResult($result);
        /** @var \Magento\Framework\Controller\Result\Json $resultJson */
        $resultJson = $this->resultFactory->create(ResultFactory::TYPE_JSON);
        $resultJson->setData($result);

        return $resultJson;
    }

    /**
     * Add ability for creating plugin
     * @param $result
     *
     * @return mixed
     */
    public function prepareResult($result)
    {
        return $result;
    }

    /**
     * @param $html
     * @param ProductInterface $product
     *
     * @return mixed
     */
    private function replaceHtmlElements($html, ProductInterface $product)
    {
        /* replace uenc for correct redirect*/
        $currentUenc = $this->urlHelper->getEncodedUrl();
        $refererUrl = $product->getProductUrl();
        $newUenc = $this->urlHelper->getEncodedUrl($refererUrl);

        $container = '#amrelated-product-container-' . $product->getId();
        $priceHolderSelector = sprintf('%s [data-role=priceBox]', $container);

        $html = str_replace($currentUenc, $newUenc, $html);
        $html = str_replace('"swatch-opt"', '"swatch-opt swatch-opt-' . $product->getId() . '"', $html);
        $html = str_replace(
            'spConfig": {"attributes',
            'spConfig": {"containerId":"' . $container . '", "attributes',
            $html
        );
        $html = str_replace(
            '[data-role=swatch-options]',
            '' . $container . ' [data-role=swatch-options]',
            $html
        );
        $html = str_replace(
            '"jsonConfig":',
            '"selectorProduct":".amrelated-product-info","jsonConfig":',
            $html
        );

        // replace priceHolderSelector for custom options . needed for find correctly price box
        $html = preg_replace(
            '@"priceHolderSelector":\s*"[^"]*"@s',
            sprintf('"priceHolderSelector":"%s"', $priceHolderSelector),
            $html
        );

        $htmlIdsToReplace = [
            'id="product_addtocart_form',
            'id="product-addtocart-button',
            'id="qty',
            'for="qty',
            'id="related-products-field',
            'id="giftcard-amount-input',
            'id="giftcard-message',
            'id="giftcard_recipient_name',
            'id="giftcard_sender_name',
            '#product_addtocart_form'
        ];

        foreach ($htmlIdsToReplace as $elementId) {
            $html = str_replace(
                $elementId,
                $elementId . '_' . $product->getId(),
                $html
            );
        }

        return $html;
    }

    /**
     * @param null $productId
     *
     * @return bool|ProductInterface
     */
    protected function initializeProduct($productId = null)
    {
        if (!$productId) {
            $productId = (int)$this->getRequest()->getParam('product');
        }

        if ($productId) {
            $storeId = $this->_objectManager->get(
                \Magento\Store\Model\StoreManagerInterface::class
            )->getStore()->getId();
            try {
                return $this->productRepository->getById($productId, false, $storeId);
            } catch (NoSuchEntityException $e) {
                return false;
            }
        }

        return false;
    }

    /**
     * Returns cart url
     *
     * @return string
     */
    private function getCartUrl()
    {
        return $this->_url->getUrl('checkout/cart', ['_secure' => true]);
    }
}
